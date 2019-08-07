import express from 'express';
import { Request, Response, NextFunction } from 'express';
import { getRepository, getConnection } from 'typeorm';
import { validationMiddleware } from '../middlewares';
import {
  InternalServerErrorException,
  NoDataFoundException,
  IntegerValidationException,
} from '../exceptions';
import {
  BlockchainBlock,
  BlockchainInput,
  BlockchainOutput,
  BlockchainKernel,
} from '../entities';
import {
  BlockchainBlockCreateDto,
  BlockchainBlockSingleViewDto,
  BlockchainBlockUpdateDto,
  BlockchainBlockPaginationDto,
  TotalDifficultyNBlockDto,
} from '../dtos';
import { Paginate } from '../utils';

var moment = require('moment');

export class BlockchainBlockController {
  public path = '/blockchain_block';
  public router = express.Router();

  constructor() {
    this.IntializeRoutes();
  }

  nanoEpic(fee) {
    if (fee == 0) {
      return this.epic(0);
    } else if (fee < 1000) {
      return fee / 1000000000;
    } else {
      return this.microEpic(parseFloat(fee) / 1000);
    }
  }

  microEpic(fee) {
    if (fee == 0) {
      return this.epic(0);
    } else if (fee < 1000) {
      return (fee * 1000000) / 1000000000;
    } else {
      return this.milliEpic(parseFloat(fee) / 1000);
    }
  }

  milliEpic(fee) {
    if (fee == 0) {
      return this.epic(0);
    } else if (fee < 1000) {
      return (fee * 1000) / 1000000000;
    } else {
      return this.epic(parseFloat(fee) / 1000);
    }
  }

  epic(fee) {
    return fee;
  }

  dateDiff(date2) {
    var current_date = new Date();
    // var current_date = new Date("Sat Apr 2 2018 15:04:00 GMT+0530 (IST)");

    var enddaydif =
      Math.abs(date2.getTime() - current_date.getTime()) /
      (1000 * 60 * 60 * 24);
    var enddayrnd = Math.round(enddaydif);
    // if(enddayrnd < 1) {
    var time = this.convertMinsToHrmin(
      Math.abs(date2.getTime() - current_date.getTime()),
    );
    return time;
    // } else if(enddayrnd == 1) {
    //   return 'Ends in ' + enddayrnd + ' day';
    // }else {
    //   return 'Ends in ' + enddayrnd + ' days';
    // }
  }

  // convertMinsToHrmin(millseconds) {
  //   var seconds = Math.floor(millseconds / 1000);
  //   var days = Math.floor(seconds / 86400);
  //   var hours = Math.floor((seconds % 86400) / 3600);
  //   var minutes = Math.floor(((seconds % 86400) % 3600) / 60);

  //   var dateTimeDurationString = '';
  //   if ((days > 0) && (hours === 0 && minutes === 0)) dateTimeDurationString += (days > 1) ? (days + ' days ') : (days + ' day ');
  //   if ((days > 0) && (hours > 0 || minutes > 0)) dateTimeDurationString += (days > 1) ? (days + ' days, ') : (days + ' day, ');
  //   if ((hours > 0) && (minutes > 0)) dateTimeDurationString += (hours > 1) ? (hours + ' hours, ') : (hours + ' hour, ');
  //   if ((hours > 0) && (minutes === 0)) dateTimeDurationString += (hours > 1) ? (hours + ' hours ') : (hours + ' hour ');
  //   if (minutes > 0) dateTimeDurationString += (minutes > 1) ? (minutes + ' minutes ') : (minutes + ' minute ');
  //   if (seconds > 0) dateTimeDurationString += (seconds > 1) ? (minutes + ' seconds ') : (minutes + ' second ');
  //   return dateTimeDurationString;
  // }

  convertMinsToHrmin(millseconds) {
    var seconds = Math.floor(millseconds / 1000);
    var days = Math.floor(seconds / 86400);
    var hours = Math.floor((seconds % 86400) / 3600);
    var minutes = Math.floor(((seconds % 86400) % 3600) / 60);
    seconds = seconds % 60;
    var dateTimeDurationString = '';

    if (days > 0 && (hours === 0 && minutes === 0))
      dateTimeDurationString += days > 1 ? days + 'd ' : days + 'd ';
    if (days > 0 && (hours > 0 || minutes > 0))
      dateTimeDurationString += days > 1 ? days + 'd ' : days + 'd ';
    if (hours > 0 && minutes > 0)
      dateTimeDurationString += hours > 1 ? hours + 'h ' : hours + 'h ';
    if (hours > 0 && minutes === 0)
      dateTimeDurationString += hours > 1 ? hours + 'h ' : hours + 'h ';
    if (minutes > 0)
      dateTimeDurationString += minutes > 1 ? minutes + 'm ' : minutes + 'm ';
    if (seconds > 0)
      dateTimeDurationString += seconds > 1 ? seconds + 's ' : seconds + 's ';
    return dateTimeDurationString;
  }

  public IntializeRoutes() {
    /**
     * @swagger
     * /epic_explorer/v1/blockchain_block:
     *   post:
     *     tags:
     *       - name: BLOCKCHAIN_BLOCK | BLOCKCHAIN_BLOCK CONTROLLER
     *     summary: create a blockchain_block
     *     description: create a blockchain_block
     *     consumes:
     *       - application/json
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: BlockchainBlock
     *         description: create a blockchain_block
     *         in: body
     *         required: true
     *         schema:
     *           $ref: '#/definitions/BlockchainBlockDto'
     *     responses:
     *       200:
     *         description: blockchain_block created successfully
     * definitions:
     *   BlockchainBlockDto:
     *    description: Dto
     *    properties:
     *      Hash:
     *           type: string
     *      Version:
     *           type: integer
     *      Height:
     *           type: integer
     *      Timestamp:
     *           type: string
     *      OutputRoot:
     *           type: string
     *      RangeProofRoot:
     *           type: string
     *      KernelRoot:
     *           type: string
     *      Nonce:
     *           type: string
     *      TotalDifficulty:
     *           type: string
     *      Previous:
     *           type: string
     *      TotalKernelOffset:
     *           type: string
     *      EdgeBits:
     *           type: integer
     *      CuckooSolution:
     *           type: string
     *      PrevRoot:
     *           type: string
     *      SecondaryScaling:
     *           type: integer
     */

    this.router.post(
      `${this.path}`,
      validationMiddleware(BlockchainBlockCreateDto),
      this.BlockchainBlockCreate,
    );

    /**
     * @swagger
     * /epic_explorer/v1/blockchain_block/totaldiff:
     *   get:
     *     tags:
     *       - name: BLOCKCHAIN_BLOCK | BLOCKCHAIN_BLOCK CONTROLLER
     *     description: To get Total Difficulty and Number of Blocks
     *     summary: To get Total Difficulty and Number of Blocks
     *     consumes:
     *       - application/json
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: FromDate
     *         description: Enter the From date
     *         in: query
     *         type: string
     *       - name: ToDate
     *         description: Enter the To date
     *         in: query
     *         type: string
     *       - name: Interval
     *         description: Try to give Intevals such as 1 week/ 15 days/ 30 days/ 60 days/ 3 months
     *         in: query
     *         type: string
     *       - name: Type
     *         description: Enter the Algorithm Type
     *         in: query
     *         type: string
     *       - name: Difftype
     *         description: Enter the Difficulty Type
     *         in: query
     *         type: string
     *     responses:
     *       200:
     *         description: Total Difficulty fetched successfully
     */
    this.router.get(
      `${this.path}/totaldiff`,
      validationMiddleware(TotalDifficultyNBlockDto, true),
      this.TotalDifficultyNBlock,
    );

       /**
     * @swagger
     * /epic_explorer/v1/blockchain_block/blockcount:
     *   get:
     *     tags:
     *       - name: BLOCKCHAIN_BLOCK | BLOCKCHAIN_BLOCK CONTROLLER
     *     description: To get Total Difficulty and Number of Blocks
     *     summary: To get Total Difficulty and Number of Blocks
     *     consumes:
     *       - application/json
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: FromDate
     *         description: Enter the From date
     *         in: query
     *         type: string
     *       - name: ToDate
     *         description: Enter the To date
     *         in: query
     *         type: string
     *       - name: Interval
     *         description: Try to give Intevals such as 1 week/ 15 days/ 30 days/ 60 days/ 3 months
     *         in: query
     *         type: string
     *     responses:
     *       200:
     *         description: Total Difficulty fetched successfully
     */
    this.router.get(
      `${this.path}/blockcount`,
      validationMiddleware(TotalDifficultyNBlockDto, true),
      this.BlockCount,
    );

    /**
     * @swagger
     * /epic_explorer/v1/blockchain_block/stackblock:
     *   get:
     *     tags:
     *       - name: STACK_BLOCK | STACK_BLOCK CONTROLLER
     *     description: To get Total Difficulty and Number of Blocks
     *     summary: To get Total Difficulty and Number of Blocks
     *     consumes:
     *       - application/json
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: FromDate
     *         description: Enter the From date
     *         in: query
     *         type: string
     *       - name: ToDate
     *         description: Enter the To date
     *         in: query
     *         type: string
     *       - name: Interval
     *         description: Try to give Intevals such as 1 week/ 15 days/ 30 days/ 60 days/ 3 months
     *         in: query
     *         type: string
     *     responses:
     *       200:
     *         description: Total Difficulty and No. of blocks   fetched successfully
     */
    this.router.get(
      `${this.path}/stackblock`,
      validationMiddleware(TotalDifficultyNBlockDto, true),
      this.StackBlock,
    );

        /**
     * @swagger
     * /epic_explorer/v1/blockchain_block/blockpiechart:
     *   get:
     *     tags:
     *       - name: STACK_BLOCK | STACK_BLOCK CONTROLLER
     *     description: To get Total Difficulty and Number of Blocks
     *     summary: To get Total Difficulty and Number of Blocks
     *     consumes:
     *       - application/json
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: FromDate
     *         description: Enter the From date
     *         in: query
     *         type: string
     *       - name: ToDate
     *         description: Enter the To date
     *         in: query
     *         type: string
     *       - name: Interval
     *         description: Try to give Intevals such as 1 week/ 15 days/ 30 days/ 60 days/ 3 months
     *         in: query
     *         type: string
     *     responses:
     *       200:
     *         description: Total Difficulty and No. of blocks   fetched successfully
     */
    this.router.get(
      `${this.path}/blockpiechart`,
      validationMiddleware(TotalDifficultyNBlockDto, true),
      this.BlockPieChart,
    );

    /**
     * @swagger
     * /epic_explorer/v1/blockchain_block/hashrate:
     *   get:
     *     tags:
     *       - name: BLOCKCHAIN_BLOCK | BLOCKCHAIN_BLOCK CONTROLLER
     *     description: To get Hash Rate of AR29 abd AT31
     *     summary: To get Hash Rate of AR29 abd AT31
     *     consumes:
     *       - application/json
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: FromDate
     *         description: Enter the From date
     *         in: query
     *         type: string
     *       - name: ToDate
     *         description: Enter the To date
     *         in: query
     *         type: string
     *       - name: Interval
     *         description: Try to give Intevals such as 1 week/ 15 days/ 30 days/ 60 days/ 3 months
     *         in: query
     *         type: string
     *     responses:
     *       200:
     *         description: Hash Rate of AR29 abd AT31 fetched successfully
     */
    this.router.get(
      `${this.path}/hashrate`,
      validationMiddleware(TotalDifficultyNBlockDto, true),
      this.HashRate,
    );

    /**
     * @swagger
     * /epic_explorer/v1/blockchain_block/latesblockdetails:
     *   get:
     *     tags:
     *       - name: BLOCKCHAIN_BLOCK | BLOCKCHAIN_BLOCK CONTROLLER
     *     description: To get Latest Block Height and Coin in Existence
     *     summary: To get Latest Block Height and Coin in Existence
     *     consumes:
     *       - application/json
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: Total Difficulty and No. of blocks   fetched successfully
     */
    this.router.get(
      `${this.path}/latesblockdetails`,
      validationMiddleware(TotalDifficultyNBlockDto, true),
      this.LatestDifficultyNBlock,
    );

    /**
     * @swagger
     * /epic_explorer/v1/blockchain_block/blockspersec:
     *   get:
     *     tags:
     *       - name: BLOCKCHAIN_BLOCK | BLOCKCHAIN_BLOCK CONTROLLER
     *     description: period of blocks generation per unit(second)
     *     summary: period of blocks generation per unit(second)
     *     consumes:
     *       - application/json
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: FromDate
     *         description: Enter the From date
     *         in: query
     *         type: string
     *       - name: ToDate
     *         description: Enter the To date
     *         in: query
     *         type: string
     *       - name: Interval
     *         description: Try to give Intevals such as 1 week/ 15 days/ 30 days/ 60 days/ 3 months
     *         in: query
     *         type: string
     *     responses:
     *       200:
     *         description: period of blocks generation per second fetched Successfully
     */
    this.router.get(
      `${this.path}/blockspersec`,
      validationMiddleware(TotalDifficultyNBlockDto, true),
      this.BlockchainBlockPerSecond,
    );

    /**
     * @swagger
     * /epic_explorer/v1/blockchain_block/supplygrowth:
     *   get:
     *     tags:
     *       - name: BLOCKCHAIN_BLOCK | BLOCKCHAIN_BLOCK CONTROLLER
     *     description: Supply growth
     *     summary: Supply growth
     *     consumes:
     *       - application/json
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: FromDate
     *         description: Enter the From date
     *         in: query
     *         type: string
     *       - name: ToDate
     *         description: Enter the To date
     *         in: query
     *         type: string
     *       - name: Interval
     *         description: Try to give Intevals such as 1 week/ 15 days/ 30 days/ 60 days/ 3 months
     *         in: query
     *         type: string
     *     responses:
     *       200:
     *         description: period of blocks generation per second fetched Successfully
     */
    this.router.get(
      `${this.path}/supplygrowth`,
      validationMiddleware(TotalDifficultyNBlockDto, true),
      this.SupplyGrowth,
    );

    /**
     * @swagger
     * /epic_explorer/v1/blockchain_block/blockminedchart:
     *   get:
     *     tags:
     *       - name: BLOCKCHAIN_BLOCK | BLOCKCHAIN_BLOCK CONTROLLER
     *     description: To get Total Difficulty and Number of Blocks
     *     summary: To get Block Mined
     *     consumes:
     *       - application/json
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: FromDate
     *         description: Enter the From date
     *         in: query
     *         type: string
     *       - name: ToDate
     *         description: Enter the To date
     *         in: query
     *         type: string
     *       - name: Interval
     *         description: Try to give Intevals such as 1 week/ 15 days/ 30 days/ 60 days/ 3 months
     *         in: query
     *         type: string
     *     responses:
     *       200:
     *         description: Block Mined chart data fetched successfully
     */
    this.router.get(
      `${this.path}/blockminedchart`,
      validationMiddleware(TotalDifficultyNBlockDto, true),
      this.BlockMineChart,
    );

    /**
     * @swagger
     * /epic_explorer/v1/blockchain_block/list:
     *   get:
     *     tags:
     *       - name: BLOCKCHAIN_BLOCK | BLOCKCHAIN_BLOCK CONTROLLER
     *     description: pagination blockchain_block
     *     summary: pagination blockchain_block
     *     consumes:
     *       - application/json
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: CurrentPage
     *         description: current page specification
     *         in: query
     *         type: integer
     *         required: true
     *       - name: PageSize
     *         description: page size specification
     *         in: query
     *         type: integer
     *         required: true
     *     responses:
     *       200:
     *         description: blockchain_block list fetched successfully
     */
    this.router.get(
      `${this.path}/list`,
      validationMiddleware(BlockchainBlockPaginationDto),
      this.BlockchainBlockPagination,
    );

    /**
     * @swagger
     * /epic_explorer/v1/blockchain_block/{hash}:
     *   get:
     *     tags:
     *       - name: BLOCKCHAIN_BLOCK | BLOCKCHAIN_BLOCK CONTROLLER
     *     summary:  get single blockchain_block
     *     description: get single blockchain_block
     *     consumes:
     *       - application/json
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: hash
     *         in: path
     *         description: blockchain_block hash
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: blockchain_block successfully fetched for given hash..
     */
    this.router.get(
      `${this.path}/:hash`,
      validationMiddleware(BlockchainBlockSingleViewDto, true),
      this.BlockchainBlockFetch,
    );

    /**
     * @swagger
     * /epic_explorer/v1/blockchain_block:
     *   patch:
     *     tags:
     *       - name: BLOCKCHAIN_BLOCK | BLOCKCHAIN_BLOCK CONTROLLER
     *     summary:  update a blockchain_block
     *     description:  update a blockchain_block
     *     consumes:
     *       - application/json
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: blockchain_block
     *         description:
     *         in: body
     *         required: true
     *         schema:
     *           $ref: '#/definitions/BlockchainBlockDto'
     *     responses:
     *       200:
     *         description: blockchain_block updated successfully
     */
    this.router.patch(
      `${this.path}`,
      validationMiddleware(BlockchainBlockUpdateDto),
      this.BlockchainBlockUpdate,
    );

    /**
     * @swagger
     * /epic_explorer/v1/blockchain_block/hash:
     *   delete:
     *     tags:
     *       - name: BLOCKCHAIN_BLOCK | BLOCKCHAIN_BLOCK CONTROLLER
     *     summary:  delete a blockchain_block
     *     description: delete a blockchain_block
     *     consumes:
     *       - application/json
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: Hash
     *         in: path
     *         description: blockchain_block hash
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: blockchain_block successfully deleted for given hash..
     */
    this.router.delete(
      `${this.path}/:hash`,
      validationMiddleware(BlockchainBlockSingleViewDto),
      this.BlockchainBlockDelete,
    );
  }

  private BlockchainBlockCreate = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => {
    try {
      const BlockchainBlockRequestData: BlockchainBlockCreateDto = request.body;
      const BlockchainBlockCreateQuery = await getRepository(
        BlockchainBlock,
      ).save(BlockchainBlockRequestData);
      response.status(200).json({
        status: 200,
        timestamp: Date.now(),
        message: 'blockchain_block created successfully',
        response: BlockchainBlockCreateQuery,
      });
    } catch (error) {
      next(new InternalServerErrorException(error));
    }
  };

  private BlockchainBlockFetch = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => {
    try {
      var BlockchainBlockFetchQuery = await getRepository(
        BlockchainBlock,
      ).findOne({
        select: [
          'Hash',
          'Height',
          'Timestamp',
          'TotalDifficultyCuckaroo',
          'TotalDifficultyCuckatoo',
          'TotalDifficultyProgpow',
          'TotalDifficultyRandomx',
          'PreviousId',
          'EdgeBits',
          'SecondaryScaling',
          'Proof',
        ],
        where: { Hash: request.params.hash },
      });
      let paramVal = request.params.hash;
      if (
        !BlockchainBlockFetchQuery &&
        !isNaN(paramVal) &&
        paramVal.length <= 10 &&
        paramVal <= 2147483647
      ) {
        var BlockchainBlockFetchQuery = await getRepository(
          BlockchainBlock,
        ).findOne({
          select: [
            'Hash',
            'Height',
            'Timestamp',
            'TotalDifficultyCuckaroo',
            'TotalDifficultyCuckatoo',
            'TotalDifficultyProgpow',
            'TotalDifficultyRandomx',
            'PreviousId',
            'EdgeBits',
            'SecondaryScaling',
            'Proof',
          ],
          where: { Height: paramVal },
        });
      }
      if (!BlockchainBlockFetchQuery) {
        next(new NoDataFoundException());
      }
      const BlockchainBlockInputFetchQuery = await getRepository(
        BlockchainInput,
      ).find({
        select: ['Data'],
        where: { BlockId: BlockchainBlockFetchQuery.Hash },
      });

      const BlockchainBlockOutputFetchQuery = await getRepository(
        BlockchainOutput,
      ).find({
        select: ['OutputType', 'Commit', 'Spent'],
        where: { BlockId: BlockchainBlockFetchQuery.Hash },
      });

      const BlockchainBlockKernalFetchQuery = await getRepository(
        BlockchainKernel,
      ).find({
        select: ['Features', 'Fee', 'LockHeight'],
        where: { BlockId: BlockchainBlockFetchQuery.Hash },
      });

      // if (BlockchainBlockFetchQuery.EdgeBits == 29) {
      //   BlockchainBlockFetchQuery['PoWAlgorithm'] = 'CuckARoo29';
      // } else {
      //   BlockchainBlockFetchQuery['PoWAlgorithm'] = 'CuckAToo31';
      // }
      BlockchainBlockFetchQuery['TotalCuckoo']=parseInt(BlockchainBlockFetchQuery.TotalDifficultyCuckaroo) +
                                               parseInt(BlockchainBlockFetchQuery.TotalDifficultyCuckatoo);
      if (BlockchainBlockFetchQuery.Height <= 1440) {
        BlockchainBlockFetchQuery['BlockReward'] = 200;
      } else if (BlockchainBlockFetchQuery.Height <= 2880) {
        BlockchainBlockFetchQuery['BlockReward'] = 180;
      } else if (BlockchainBlockFetchQuery.Height <= 4320) {
        BlockchainBlockFetchQuery['BlockReward'] = 160;
      } else if (BlockchainBlockFetchQuery.Height <= 5760) {
        BlockchainBlockFetchQuery['BlockReward'] = 140;
      } else if (BlockchainBlockFetchQuery.Height <= 7200) {
        BlockchainBlockFetchQuery['BlockReward'] = 120;
      } else if (BlockchainBlockFetchQuery.Height <= 8640) {
        BlockchainBlockFetchQuery['BlockReward'] = 100;
      } else if (BlockchainBlockFetchQuery.Height <= 10080) {
        BlockchainBlockFetchQuery['BlockReward'] = 80;
      } else if (BlockchainBlockFetchQuery.Height <= 11520) {
        BlockchainBlockFetchQuery['BlockReward'] = 60;
      } else if (BlockchainBlockFetchQuery.Height <= 12960) {
        BlockchainBlockFetchQuery['BlockReward'] = 50;
      } else {
        BlockchainBlockFetchQuery['BlockReward'] = 25;
      }

      if (BlockchainBlockFetchQuery.PreviousId) {
        const BlockchainPreviousBlockFetchQuery = await getRepository(
          BlockchainBlock,
        ).findOne({
          select: ['TotalDifficultyCuckaroo', 'TotalDifficultyCuckatoo', 'TotalDifficultyProgpow', 'TotalDifficultyRandomx'],
          where: { Hash: BlockchainBlockFetchQuery.PreviousId },
        });
        BlockchainBlockFetchQuery['TargetDifficultyCuckaroo'] =
          parseInt(BlockchainBlockFetchQuery.TotalDifficultyCuckaroo) -
          parseInt(BlockchainPreviousBlockFetchQuery.TotalDifficultyCuckaroo);
        BlockchainBlockFetchQuery['TargetDifficultyCuckatoo'] =
          parseInt(BlockchainBlockFetchQuery.TotalDifficultyCuckatoo) -
          parseInt(BlockchainPreviousBlockFetchQuery.TotalDifficultyCuckatoo);
        BlockchainBlockFetchQuery['TargetDifficultyProgpow'] =
          parseInt(BlockchainBlockFetchQuery.TotalDifficultyProgpow) -
          parseInt(BlockchainPreviousBlockFetchQuery.TotalDifficultyProgpow);
        BlockchainBlockFetchQuery['TargetDifficultyRandomx'] =
          parseInt(BlockchainBlockFetchQuery.TotalDifficultyRandomx) -
          parseInt(BlockchainPreviousBlockFetchQuery.TotalDifficultyRandomx);
      } else {
        BlockchainBlockFetchQuery['TargetDifficultyCuckaroo'] = 'NULL';
        BlockchainBlockFetchQuery['TargetDifficultyCuckatoo'] = 'NULL';
        BlockchainBlockFetchQuery['TargetDifficultyProgpow'] = 'NULL';
        BlockchainBlockFetchQuery['TargetDifficultyRandomx'] = 'NULL';
      }
      var Epicfee = 0;
      BlockchainBlockKernalFetchQuery.forEach(e => {
        e.Fee = this.nanoEpic(e.Fee);
        Epicfee = Epicfee + e.Fee;
      });
      BlockchainBlockFetchQuery['Fee'] = Epicfee;

      BlockchainBlockFetchQuery['Timestamp'] = moment
        .utc(BlockchainBlockFetchQuery['Timestamp'])
        .utc()
        .format('YYYY-MM-DD, HH:MM:SS UTC');

      BlockchainBlockFetchQuery['hashstart'] = BlockchainBlockFetchQuery[
        'Hash'
      ].slice(0, 2);
      BlockchainBlockFetchQuery['hashend'] = BlockchainBlockFetchQuery[
        'Hash'
      ].slice(62, 64);
      let balance = BlockchainBlockFetchQuery['Hash'].substring(2, 62);
      let arr = balance.match(/.{1,6}/g);
      BlockchainBlockFetchQuery['hasharray'] = arr.map(i => '#' + i);

      BlockchainBlockFetchQuery
        ? response.status(200).json({
          status: 200,
          timestamp: Date.now(),
          message: 'blockchain_blocksuccessfully fetched for given id.',
          response: {
            BlockchainBlockFetchQuery: BlockchainBlockFetchQuery,
            BlockchainBlockInputFetchQuery: BlockchainBlockInputFetchQuery,
            BlockchainBlockOutputFetchQuery: BlockchainBlockOutputFetchQuery,
            BlockchainBlockKernalFetchQuery: BlockchainBlockKernalFetchQuery,
          },
        })
        : next(new NoDataFoundException());
    } catch (error) {
      console.log('error', error);
      next(new InternalServerErrorException(error));
    }
  };

  private BlockchainBlockUpdate = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => {
    try {
      const BlockchainBlockRequestData: BlockchainBlockUpdateDto = request.body;
      const BlockchainBlockUpdateQuery = await getRepository(
        BlockchainBlock,
      ).update(BlockchainBlockRequestData.Hash, BlockchainBlockRequestData);
      response.status(200).json({
        status: 200,
        timestamp: Date.now(),
        message: 'blockchain_block updated succesfully',
        response: { ...BlockchainBlockUpdateQuery },
      });
    } catch (error) {
      next(new InternalServerErrorException(error));
    }
  };

  private BlockchainBlockDelete = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => {
    try {
      const BlockchainBlockDeleteQuery = await getRepository(
        BlockchainBlock,
      ).delete(request.params.Hash);
      BlockchainBlockDeleteQuery
        ? response.status(200).json({
          status: 200,
          timestamp: Date.now(),
          message: 'blockchain_block successfully deleted for given hash.',
          response: { ...BlockchainBlockDeleteQuery },
        })
        : next(new NoDataFoundException());
    } catch (error) {
      next(new InternalServerErrorException(error));
    }
  };

  private BlockchainBlockPagination = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => {
    try {
      const {
        CurrentPage,
        // MaxPages,
        PageSize,
      }: BlockchainBlockPaginationDto = request.query;
      if (parseInt(CurrentPage) == NaN) {
        next(new IntegerValidationException('CurrentPage'));
      } else if (parseInt(PageSize) == NaN) {
        next(new IntegerValidationException('PageSize'));
      }
      // else if (parseInt(MaxPages) == NaN) {
      //   next(new IntegerValidationException('MaxPages'));
      // }
      else {
        const BlockchainBlockCountQuery = await getRepository(BlockchainBlock)
          .createQueryBuilder()
          .getCount();
        if (BlockchainBlockCountQuery) {
          const PaginationReponseData = Paginate(
            BlockchainBlockCountQuery,
            parseInt(CurrentPage),
            parseInt(PageSize),
            // parseInt(MaxPages),
          );
          // const BlockchainBlockPaginationQuery = await getRepository(
          //   BlockchainBlock,
          // ).find({
          //   skip: PaginationReponseData.startIndex,
          //   take: PaginationReponseData.pageSize,
          //   order: {
          //     Hash: 'DESC',
          //   },
          // });
          const BlockchainBlockPaginationQuery = await getRepository(
            BlockchainBlock,
          )
            .createQueryBuilder('blockchain_block')
            .select([
              'blockchain_block.Hash',
              'blockchain_block.Timestamp',
              '(blockchain_block.TotalDifficultyCuckaroo + blockchain_block.TotalDifficultyCuckatoo) as TotalCuckoo',
              'blockchain_block.TotalDifficultyCuckaroo',
              'blockchain_block.TotalDifficultyCuckatoo',
              'blockchain_block.TotalDifficultyProgpow',
              'blockchain_block.TotalDifficultyRandomx',
              'blockchain_block.previous_id',
              'blockchain_block.total_difficulty_cuckaroo - LAG(blockchain_block.total_difficulty_cuckaroo) OVER (ORDER BY blockchain_block.total_difficulty_cuckaroo) AS target_difficulty_cuckaroo',
              'blockchain_block.total_difficulty_cuckatoo - LAG(blockchain_block.total_difficulty_cuckatoo) OVER (ORDER BY blockchain_block.total_difficulty_cuckatoo) AS target_difficulty_cuckatoo',
              'blockchain_block.total_difficulty_progpow - LAG(blockchain_block.total_difficulty_progpow) OVER (ORDER BY blockchain_block.total_difficulty_progpow) AS target_difficulty_progpow',
              'blockchain_block.total_difficulty_randomx - LAG(blockchain_block.total_difficulty_randomx) OVER (ORDER BY blockchain_block.total_difficulty_randomx) AS target_difficulty_randomx',
              'blockchain_block.Height',
              'blockchain_block.EdgeBits',
              'COUNT(DISTINCT(blockchain_input.block_id)) AS input_count',
              'COUNT(DISTINCT(blockchain_kernel.block_id)) AS kernal_count',
              'COUNT(DISTINCT(blockchain_output.block_id)) AS output_count',
              'blockchain_block.Proof As PoWAlgo',
            ])
            // .addSelect(
            //   `CASE
            //             WHEN blockchain_block.EdgeBits = 29 THEN 'CuckARoo29'
            //             WHEN blockchain_block.EdgeBits = 31 THEN 'CuckAToo31'
            //         END`,
            //   'PoWAlgo',
            // )
            .leftJoin('blockchain_block.BlockchainInputs', 'blockchain_input')
            .leftJoin('blockchain_block.BlockchainKernels', 'blockchain_kernel')
            .leftJoin('blockchain_block.BlockchainOutputs', 'blockchain_output')
            .skip(PaginationReponseData.startIndex)
            .take(PaginationReponseData.pageSize)
            .orderBy('blockchain_block.Timestamp', 'DESC')
            .groupBy('blockchain_block.Hash')
            .getRawAndEntities();

          //console.log(BlockchainBlockPaginationQuery.raw);

          let BlockchainBlockResult = BlockchainBlockPaginationQuery.raw;
          let lastElemt =
            BlockchainBlockResult[BlockchainBlockResult.length - 1];
          const BlockchainPreviousBlockFetchQuery = await getRepository(
            BlockchainBlock,
          ).findOne({
            select: ['TotalDifficultyCuckaroo', 'TotalDifficultyCuckatoo', 'TotalDifficultyProgpow', 'TotalDifficultyRandomx'],
            where: { Hash: lastElemt.previous_id },
          });

          BlockchainBlockResult[BlockchainBlockResult.length - 1][
            'target_difficulty_cuckaroo'
          ] = BlockchainPreviousBlockFetchQuery &&
            BlockchainPreviousBlockFetchQuery != undefined ?
              (parseInt(lastElemt.blockchain_block_total_difficulty_cuckaroo)
                ? parseInt(lastElemt.blockchain_block_total_difficulty_cuckaroo)
                : 0) -
              (parseInt(BlockchainPreviousBlockFetchQuery.TotalDifficultyCuckaroo) ? parseInt(BlockchainPreviousBlockFetchQuery.TotalDifficultyCuckaroo) : 0)
              : 0;

          BlockchainBlockResult[BlockchainBlockResult.length - 1][
            'target_difficulty_cuckatoo'
          ] = BlockchainPreviousBlockFetchQuery &&
            BlockchainPreviousBlockFetchQuery != undefined ?
              (parseInt(lastElemt.blockchain_block_total_difficulty_cuckatoo)
                ? parseInt(lastElemt.blockchain_block_total_difficulty_cuckatoo)
                : 0) -
              (parseInt(BlockchainPreviousBlockFetchQuery.TotalDifficultyCuckatoo) ? parseInt(BlockchainPreviousBlockFetchQuery.TotalDifficultyCuckatoo) : 0)
              : 0;

          BlockchainBlockResult[BlockchainBlockResult.length - 1][
            'target_difficulty_progpow'
          ] = BlockchainPreviousBlockFetchQuery &&
            BlockchainPreviousBlockFetchQuery != undefined ?
              (parseInt(lastElemt.blockchain_block_total_difficulty_progpow)
                ? parseInt(lastElemt.blockchain_block_total_difficulty_progpow)
                : 0) -
              (parseInt(BlockchainPreviousBlockFetchQuery.TotalDifficultyProgpow) ? parseInt(BlockchainPreviousBlockFetchQuery.TotalDifficultyProgpow) : 0)
              : 0;

          BlockchainBlockResult[BlockchainBlockResult.length - 1][
            'target_difficulty_randomx'
          ] = BlockchainPreviousBlockFetchQuery &&
            BlockchainPreviousBlockFetchQuery != undefined ?
              (parseInt(lastElemt.blockchain_block_total_difficulty_randomx)
                ? parseInt(lastElemt.blockchain_block_total_difficulty_randomx)
                : 0) -
              (parseInt(BlockchainPreviousBlockFetchQuery.TotalDifficultyRandomx) ? parseInt(BlockchainPreviousBlockFetchQuery.TotalDifficultyRandomx) : 0)
              : 0;

          BlockchainBlockResult.forEach(e => {
            var latest_block = this.dateDiff(e.blockchain_block_timestamp);
            e['hashstart'] = e.blockchain_block_hash.slice(0, 2);
            e['hashend'] = e.blockchain_block_hash.slice(62, 64);
            let balance = e.blockchain_block_hash.substring(2, 62);
            let arr = balance.match(/.{1,6}/g);
            e['hasharray'] = arr.map(i => '#' + i);
            e['age'] = latest_block;
          });

          //console.log(BlockchainBlockPaginationQueryRawResult);

          response.status(200).json({
            status: 200,
            timestamp: Date.now(),
            message: 'blockchain_block list fetched successfully',
            response: {
              ...PaginationReponseData,
              BlockchainBlockResult,
            },
          });
        } else {
          next(new NoDataFoundException());
        }
      }
    } catch (error) {
      console.log('error', error);
      next(new InternalServerErrorException(error));
    }
  };

  private BlockCount = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => {
    try {
      const TotalDifficultyNBlockRequestData: TotalDifficultyNBlockDto =
        request.query;
      if (TotalDifficultyNBlockRequestData.Interval) {
        var timeIntervalQry =
          "timestamp at time zone '" +
          process.env.TIME_ZONE +
          "' > current_date - interval '" +
          TotalDifficultyNBlockRequestData.Interval +
          "'";
      } else if (
        TotalDifficultyNBlockRequestData.FromDate ||
        TotalDifficultyNBlockRequestData.ToDate
      ) {
        let fromdate = moment(TotalDifficultyNBlockRequestData.FromDate)
          .utc()
          .format('YYYY-MM-DD');
        let todate = moment(TotalDifficultyNBlockRequestData.ToDate)
          .utc()
          .format('YYYY-MM-DD');

        var timeIntervalQry =
          "timestamp at time zone '" +
          process.env.TIME_ZONE +
          "'  BETWEEN SYMMETRIC '" +
          fromdate +
          "' AND '" +
          todate +
          "'";
      } else {
          var timeIntervalQry =
          "timestamp at time zone '" +
          process.env.TIME_ZONE +
          "' > current_date - interval '30 days'";
      }
      const BlockQuery = await getConnection()
        .query(
          "select 1 as hash, max(total_difficulty_cuckaroo) as total_difficulty_cuckaroo, \
          max(total_difficulty_cuckatoo) as total_difficulty_cuckatoo, \
          max(total_difficulty_progpow) as total_difficulty_progpow, \
          max(total_difficulty_randomx) as total_difficulty_randomx, date(DATE_TRUNC('day', timestamp at time zone '" +
          process.env.TIME_ZONE +
          "')) as date, count(hash) as blocks \
        from blockchain_block where " +
        timeIntervalQry +
          "group by DATE_TRUNC('day', timestamp at time zone '" +
          process.env.TIME_ZONE +
          "') order by date",
        )
        .catch(err_msg => {
          next(err_msg);
        });

      let date = [],
        blockDate = [],
        blocks = [];

      BlockQuery.forEach(e => {
          blockDate.push(moment(e.date).format('YYYY-MM-DD'));
        blocks.push(parseInt(e.blocks));
      });
      response.status(200).json({
        status: 200,
        timestamp: Date.now(),
        message: 'Total Difficulty and Blocks Data fetched Successfully',
        response: {
          Date: date,
          Blocks: blocks,
          blockDate:blockDate
        },
      });
    } catch (error) {
      next(new InternalServerErrorException(error));
    }
  };

  private TotalDifficultyNBlock = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => {
    try {
      const TotalDifficultyNBlockRequestData: TotalDifficultyNBlockDto =
        request.query;
      if (TotalDifficultyNBlockRequestData.Interval) {
        var timeIntervalQry =
          "timestamp at time zone '" +
          process.env.TIME_ZONE +
          "' > current_date - interval '" +
          TotalDifficultyNBlockRequestData.Interval +
          "'";
      } else if (
        TotalDifficultyNBlockRequestData.FromDate ||
        TotalDifficultyNBlockRequestData.ToDate
      ) {
        let fromdate = moment(TotalDifficultyNBlockRequestData.FromDate)
          .utc()
          .format('YYYY-MM-DD');
        let todate = moment(TotalDifficultyNBlockRequestData.ToDate)
          .utc()
          .format('YYYY-MM-DD');

        var timeIntervalQry =
          "timestamp at time zone '" +
          process.env.TIME_ZONE +
          "'  BETWEEN SYMMETRIC '" +
          fromdate +
          "' AND '" +
          todate +
          "'";
      } else {
          var timeIntervalQry =
          "timestamp at time zone '" +
          process.env.TIME_ZONE +
          "' > current_date - interval '1 day'";

      }
      var alog_type = TotalDifficultyNBlockRequestData.Type;
      var Difftype = TotalDifficultyNBlockRequestData.Difftype;
      if (TotalDifficultyNBlockRequestData.Interval && TotalDifficultyNBlockRequestData.Interval != '1 day') {
        var dateFormat = 'YYYY-MM-DD';
      }else{
        var dateFormat = 'hh:mm';
      }
      if(Difftype == "target"){
        var TotalDifficultyNBlockQuery = await getConnection()
        .query(
          "SELECT a.hash, a.tarket_difficulty, a.date FROM(select 1 as hash, (total_difficulty_"+alog_type+" - LAG(total_difficulty_"+alog_type+") OVER (ORDER BY total_difficulty_"+alog_type+")) AS tarket_difficulty, \
             DATE_TRUNC('minute', timestamp at time zone '" +
            process.env.TIME_ZONE +
            "') as date \
          from blockchain_block where " +
          timeIntervalQry +
            " order by height) as a WHERE a.tarket_difficulty IS NOT NULL",
        )
        .catch(err_msg => {
          next(err_msg);
        });
        }else if(Difftype == "solution"){
          var TotalDifficultyNBlockQuery = await getConnection()
          .query(
            "SELECT a.hash, a.tarket_difficulty, a.date FROM(select 1 as hash, (total_difficulty_"+alog_type+" - LAG(total_difficulty_"+alog_type+") OVER (ORDER BY total_difficulty_"+alog_type+")) AS tarket_difficulty, \
               DATE_TRUNC('minute', timestamp at time zone '" +
              process.env.TIME_ZONE +
              "') as date \
            from blockchain_block where " +
            timeIntervalQry +
              " order by height) as a WHERE a.tarket_difficulty IS NOT NULL",
          )
          .catch(err_msg => {
            next(err_msg);
          });
        }else if(Difftype == "total"){
          var TotalDifficultyNBlockQuery = await getConnection()
          .query(
            "select 1 as hash, total_difficulty_"+alog_type+" as tarket_difficulty, \
               DATE_TRUNC('minute', timestamp at time zone '" +
              process.env.TIME_ZONE +
              "') as date \
            from blockchain_block where " +
            timeIntervalQry +
              " order by height",
          )
          .catch(err_msg => {
            next(err_msg);
          });
        }else{
          var TotalDifficultyNBlockQuery = await getConnection()
          .query(
            "SELECT a.hash, a.tarket_difficulty, a.date FROM(select 1 as hash, (total_difficulty_"+alog_type+" - LAG(total_difficulty_"+alog_type+") OVER (ORDER BY total_difficulty_"+alog_type+")) AS tarket_difficulty, \
               DATE_TRUNC('minute', timestamp at time zone '" +
              process.env.TIME_ZONE +
              "') as date \
            from blockchain_block where " +
            timeIntervalQry +
              " order by height) as a WHERE a.tarket_difficulty IS NOT NULL",
          )
          .catch(err_msg => {
            next(err_msg);
          });
        }
      let date = [],
        //DifficultyCuckaroo = [],
        //DifficultyCuckatoo = [],
        //DifficultyProgpow = [],
        //DifficultyRandomx = [];

        TargetDifficulty = [];

        TotalDifficultyNBlockQuery.forEach(e => {
          //date.indexOf(moment(e.date).format('YYYY-MM-DD')) < 0 ?
         date.push(moment(e.date).format(dateFormat));
        // DifficultyCuckaroo.push(parseInt(e.total_difficulty_cuckaroo));
        // DifficultyCuckatoo.push(parseInt(e.total_difficulty_cuckatoo));
        // DifficultyProgpow.push(parseInt(e.total_difficulty_progpow));
        // DifficultyRandomx.push(parseInt(e.total_difficulty_randomx));
        TargetDifficulty.push(parseInt(e.tarket_difficulty));
      });

      response.status(200).json({
        status: 200,
        timestamp: Date.now(),
        message: 'Difficulty and Blocks Data fetched Successfully',
        response: {
          Date: date,
          // DifficultyCuckaroo: DifficultyCuckaroo,
          // DifficultyCuckatoo: DifficultyCuckatoo,
          // DifficultyProgpow: DifficultyProgpow,
          TargetDifficulty: TargetDifficulty
        },
      });
    } catch (error) {
      next(new InternalServerErrorException(error));
    }
  };

  private StackBlock = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => {
    try {
      const TotalDifficultyNBlockRequestData: TotalDifficultyNBlockDto =
        request.query;
      if (TotalDifficultyNBlockRequestData.Interval) {
        var timeIntervalQry =
          "timestamp at time zone '" +
          process.env.TIME_ZONE +
          "' > current_date - interval '" +
          TotalDifficultyNBlockRequestData.Interval +
          "'";
      } else if (
        TotalDifficultyNBlockRequestData.FromDate ||
        TotalDifficultyNBlockRequestData.ToDate
      ) {
        let fromdate = moment(TotalDifficultyNBlockRequestData.FromDate)
          .utc()
          .format('YYYY-MM-DD');
        let todate = moment(TotalDifficultyNBlockRequestData.ToDate)
          .utc()
          .format('YYYY-MM-DD');

        var timeIntervalQry =
          "timestamp at time zone '" +
          process.env.TIME_ZONE +
          "'  BETWEEN SYMMETRIC '" +
          fromdate +
          "' AND '" +
          todate +
          "'";
      } else {
        var timeIntervalQry =
          "timestamp at time zone '" +
          process.env.TIME_ZONE +
          "' > current_date - interval '30 days'";
      }
      const stackNBlockQuery = await getConnection()
        .query(
          "select 1 as hash, date(DATE_TRUNC('day', timestamp at time zone '" +
          process.env.TIME_ZONE +
          "')) as date, Count( CASE WHEN proof = 'RandomX' THEN 1 ELSE NULL END) AS RandomX, \
                          Count( CASE  WHEN proof = 'Cuckoo' THEN 1 ELSE NULL END) AS Cuckoo,\
                          Count( CASE WHEN proof = 'ProgPow' THEN 1 ELSE NULL END) AS ProgPow \
            from blockchain_block where " +
          timeIntervalQry +
          "group by DATE_TRUNC('day', timestamp at time zone '" +
          process.env.TIME_ZONE +
          "') order by date",
        )
        .catch(err_msg => {
          next(err_msg);
        });
      let date = [],
      Blocks = [],
        Cuckoo = [],
        ProgPow = [],
        RandomX = [];
      stackNBlockQuery.forEach(e => {
        date.push(moment(e.date).format('YYYY-MM-DD'));
        // Blocks.push({Cuckaroo: parseInt(e.cuckaroo), Cuckatoo : parseInt(e.cuckatoo), ProgPow : parseInt(e.progpow), RandomX : parseInt(e.randomx)})
        Cuckoo.push(parseInt(e.cuckoo));
        ProgPow.push(parseInt(e.progpow));
        RandomX.push(parseInt(e.randomx));
      });
      response.status(200).json({
        status: 200,
        timestamp: Date.now(),
        message: 'Stack Data fetched Successfully',
        response: {
          Date: date,
          Cuckoo:Cuckoo,
          ProgPow:ProgPow,
          RandomX:RandomX
        },
      });
    } catch (error) {
      next(new InternalServerErrorException(error));
    }
  };

  private BlockPieChart = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => {
    try {
      const TotalDifficultyNBlockRequestData: TotalDifficultyNBlockDto =
        request.query;
      if (TotalDifficultyNBlockRequestData.Interval) {
        var timeIntervalQry =
          "timestamp at time zone '" +
          process.env.TIME_ZONE +
          "' > current_date - interval '" +
          TotalDifficultyNBlockRequestData.Interval +
          "'";
      } else if (
        TotalDifficultyNBlockRequestData.FromDate ||
        TotalDifficultyNBlockRequestData.ToDate
      ) {
        let fromdate = moment(TotalDifficultyNBlockRequestData.FromDate)
          .utc()
          .format('YYYY-MM-DD');
        let todate = moment(TotalDifficultyNBlockRequestData.ToDate)
          .utc()
          .format('YYYY-MM-DD');

        var timeIntervalQry =
          "timestamp at time zone '" +
          process.env.TIME_ZONE +
          "'  BETWEEN SYMMETRIC '" +
          fromdate +
          "' AND '" +
          todate +
          "'";
      } else {
        var timeIntervalQry =
          "timestamp at time zone '" +
          process.env.TIME_ZONE +
          "' > current_date - interval '30 days'";
      }
      const stackNBlockQuery = await getConnection()
        .query(
          "SELECT hash,total_edge_bits, RandomX, Cuckoo, ProgPow, Round(RandomX * 100.0 / total_edge_bits,2) AS RandomXper,  Round(Cuckoo * 100.0 / total_edge_bits,2) AS Cuckooper, Round(ProgPow * 100.0 / total_edge_bits,2) AS ProgPowper from (select 1 as hash, COUNT(edge_bits) AS total_edge_bits, \
          Count( CASE WHEN proof = 'RandomX' THEN 1 ELSE NULL END) AS RandomX,\
           Count( CASE  WHEN proof = 'Cuckoo' THEN 1 ELSE NULL END) AS Cuckoo,\
            Count( CASE WHEN proof = 'ProgPow' THEN 1 ELSE NULL END) AS ProgPow \
          from blockchain_block  where " +
          timeIntervalQry +
          ")t"
        )
        .catch(err_msg => {
          next(err_msg);
        });
      let label = [],
      value = [];

      stackNBlockQuery.forEach(e => {
        label.push("Cuckoo","ProgPow","RandomX");
        value.push(parseInt(e.cuckoo),parseInt(e.progpow),parseInt(e.randomx));
      });
      response.status(200).json({
        status: 200,
        timestamp: Date.now(),
        message: 'Piechart for block is fetched Successfully',
        response: {
          label,
          value
        },
      });
    } catch (error) {
      next(new InternalServerErrorException(error));
    }
  };

  private HashRate = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => {
    try {
      const TotalDifficultyNBlockRequestData: TotalDifficultyNBlockDto =
        request.query;
      if (TotalDifficultyNBlockRequestData.Interval) {
        var timeIntervalQry =
          "timestamp > current_date - interval '" +
          TotalDifficultyNBlockRequestData.Interval +
          "'";
        var seriesquery =
          "now() - interval '" +
          TotalDifficultyNBlockRequestData.Interval +
          "', now()";
      } else if (
        TotalDifficultyNBlockRequestData.FromDate ||
        TotalDifficultyNBlockRequestData.ToDate
      ) {
        let fromdate = moment(TotalDifficultyNBlockRequestData.FromDate)
          .utc()
          .format('YYYY-MM-DD');
        let todate = moment(TotalDifficultyNBlockRequestData.ToDate)
          .utc()
          .format('YYYY-MM-DD');

        var timeIntervalQry =
          'timestamp BETWEEN SYMMETRIC ' + fromdate + ' AND ' + todate;

        var seriesquery = "'" + fromdate + "'::timestamp, '" + todate + "'";
      } else {
        var timeIntervalQry = "timestamp > current_date - interval '30 days'";
        var seriesquery = "now() - interval '30 days', now()";
      }

      const HashRateQueryAR29 = await getConnection()
        .query(
          'with hours as ( SELECT hour::date from generate_series(' +
          seriesquery +
          ", '1 day') as hour),tblDifference AS(select ROW_NUMBER() OVER(ORDER BY DATE_TRUNC('day', timestamp)) AS RowNumber, max(total_difficulty) as total_difficulty, date(DATE_TRUNC('day', timestamp)) as date, count(hash) as blocks       from blockchain_block where " +
          timeIntervalQry +
          " and edge_bits=29 group by DATE_TRUNC('day', timestamp) order by date) select coalesce(max(t1.total_difficulty), 0) as total_difficulty, coalesce(max(t1.difficulty), 0) as difficulty, hours.hour, coalesce(max(t1.blocks), 0) as blocks, coalesce(max(t1.hashrate), 0) as hashrate  from hours left join(SELECT cur.total_difficulty, cur.total_difficulty - previous.total_difficulty as difficulty, cur.date, cur.blocks,   ((cast(cur.blocks as decimal) / 1440) * (cur.total_difficulty - previous.total_difficulty) * (2^32 / 60))  as hashrate FROM tblDifference cur LEFT OUTER JOIN tblDifference previous ON cur.RowNumber = previous.RowNumber + 1) as t1 on t1.date = hours.hour group by hours.hour order by hours.hour",
        )
        .catch(err_msg => {
          next(err_msg);
        });
      const HashRateQueryAT31 = await getConnection()
        .query(
          'with hours as ( SELECT hour::date from generate_series(' +
          seriesquery +
          ", '1 day') as hour),tblDifference AS(select ROW_NUMBER() OVER(ORDER BY DATE_TRUNC('day', timestamp)) AS RowNumber, max(total_difficulty) as total_difficulty, date(DATE_TRUNC('day', timestamp)) as date, count(hash) as blocks       from blockchain_block where " +
          timeIntervalQry +
          " and edge_bits=31 group by DATE_TRUNC('day', timestamp) order by date) select coalesce(max(t1.total_difficulty), 0) as total_difficulty , coalesce(max(t1.difficulty), 0) as difficulty, hours.hour, coalesce(max(t1.blocks), 0) as blocks, coalesce(max(t1.hashrate), 0) as hashrate  from hours left join(SELECT cur.total_difficulty, cur.total_difficulty - previous.total_difficulty as difficulty, cur.date, cur.blocks,   ((cast(cur.blocks as decimal) / 1440) * (cur.total_difficulty - previous.total_difficulty) * (2^32 / 60))  as hashrate FROM tblDifference cur LEFT OUTER JOIN tblDifference previous ON cur.RowNumber = previous.RowNumber + 1) as t1 on t1.date = hours.hour group by hours.hour order by hours.hour",
        )
        .catch(err_msg => {
          next(err_msg);
        });
      let date = [],
        hashrate29 = [],
        hashrate31 = [];
      HashRateQueryAR29.forEach(function (e, index) {
        if (index > 0) {
          date.push(moment(e.hour).format('YYYY-MM-DD'));
          hashrate29.push(
            Math.round((parseInt(e.hashrate) / 1000000000) * 100) / 100,
          );
        }
      });
      HashRateQueryAT31.forEach(function (e, index) {
        if (index > 0) {
          hashrate31.push(
            Math.round((parseInt(e.hashrate) / 1000000000) * 100) / 100,
          );
        }
      });

      response.status(200).json({
        status: 200,
        timestamp: Date.now(),
        message: 'Total Difficulty and Blocks Data fetched Successfully',
        response: {
          date,
          hashrate29,
          hashrate31,
        },
      });
    } catch (error) {
      next(new InternalServerErrorException(error));
    }
  };

  private LatestDifficultyNBlock = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => {
    try {
      let block_height = '',
        letest_block = '',
        letest_block_num = '',
        letest_block_duration = '';

      const BlockchainLatestBlockQuery = await getConnection()
        .query(
          'SELECT timestamp,height,edge_bits,hash,secondary_scaling, previous_id, total_difficulty_cuckaroo, total_difficulty_cuckatoo, total_difficulty_progpow, total_difficulty_randomx FROM blockchain_block ORDER BY timestamp DESC LIMIT 1',
        )
        .catch(err_msg => {
          next(err_msg);
        });
      const BlockchainPreviousBlockQuery = await getConnection()
        .query(
          'SELECT total_difficulty_cuckaroo, total_difficulty_cuckatoo, total_difficulty_progpow, total_difficulty_randomx FROM blockchain_block WHERE hash=' +
          "'" +
          BlockchainLatestBlockQuery[0].previous_id +
          "'",
        )
        .catch(err_msg => {
          next(err_msg);
        });

      let height = BlockchainLatestBlockQuery[0].height;

      if (height > 12960) {
        var remain_block = height - 12960;
        var coin_existence =
          1440 * 200 +
          1440 * 180 +
          1440 * 160 +
          1440 * 140 +
          1440 * 120 +
          1440 * 100 +
          1440 * 80 +
          1440 * 60 +
          1440 * 50 +
          25 * remain_block;
      } else if (height > 11520) {
        var remain_block = height - 11520;
        var coin_existence =
          1440 * 200 +
          1440 * 180 +
          1440 * 160 +
          1440 * 140 +
          1440 * 120 +
          1440 * 100 +
          1440 * 80 +
          1440 * 60 +
          remain_block * 50;
      } else if (height > 10080) {
        var remain_block = height - 10080;
        var coin_existence =
          1440 * 200 +
          1440 * 180 +
          1440 * 160 +
          1440 * 140 +
          1440 * 120 +
          1440 * 100 +
          1440 * 80 +
          remain_block * 60;
      } else if (height > 8640) {
        var remain_block = height - 8640;
        var coin_existence =
          1440 * 200 +
          1440 * 180 +
          1440 * 160 +
          1440 * 140 +
          1440 * 120 +
          1440 * 100 +
          remain_block * 80;
      } else if (height > 7200) {
        var remain_block = height - 7200;
        var coin_existence =
          1440 * 200 +
          1440 * 180 +
          1440 * 160 +
          1440 * 140 +
          1440 * 120 +
          remain_block * 100;
      } else if (height > 5760) {
        var remain_block = height - 5760;
        var coin_existence =
          1440 * 200 +
          1440 * 180 +
          1440 * 160 +
          1440 * 140 +
          remain_block * 120;
      } else if (height > 4320) {
        var remain_block = height - 4320;
        var coin_existence =
          1440 * 200 + 1440 * 180 + 1440 * 160 + remain_block * 140;
      } else if (height > 2880) {
        var remain_block = height - 2880;
        var coin_existence = 1440 * 200 + 1440 * 180 + remain_block * 160;
      } else if (height > 1440) {
        var remain_block = height - 1440;
        var coin_existence = 1440 * 200 + remain_block * 180;
      } else {
        var coin_existence = height * 200;
      }

      letest_block = moment(BlockchainLatestBlockQuery[0].timestamp).fromNow();
      letest_block_num = letest_block.substr(0, letest_block.indexOf(' ')); // "72"
      letest_block_duration = letest_block.substr(
        letest_block.indexOf(' ') + 1,
      ); // "tocirah sneab"
      const SECOND_POW_EDGE_BITS = 29;
      const BASE_EDGE_BITS = 24;

      if (BlockchainLatestBlockQuery[0].edge_bits == SECOND_POW_EDGE_BITS) {
        var hashvalue = BlockchainLatestBlockQuery[0].hash;
        var diff =
          (BlockchainLatestBlockQuery[0].secondary_scaling * 2 ** 64) /
          parseInt(hashvalue.substring(0, 16), 16);
        var result = Math.min(diff, 0xffffffffffffffff);
        var difficulty = Math.round(result);
      } else {
        var graph_weight =
          2 *
          2 ** (BlockchainLatestBlockQuery[0].edge_bits - BASE_EDGE_BITS) *
          BlockchainLatestBlockQuery[0].edge_bits;
        var hashvalue = BlockchainLatestBlockQuery[0].hash;
        var diff =
          (graph_weight * 2 ** 64) / parseInt(hashvalue.substring(0, 16), 16);
        var result = Math.min(diff, 0xffffffffffffffff);
        var difficulty = Math.round(result);
      }

      if (BlockchainLatestBlockQuery[0].previous_id) {
        var targetdifficultycuckaroo =
          BlockchainLatestBlockQuery[0].total_difficulty_cuckaroo -
          BlockchainPreviousBlockQuery[0].total_difficulty_cuckaroo;
        var targetdifficultycuckatoo =
          BlockchainLatestBlockQuery[0].total_difficulty_cuckatoo -
          BlockchainPreviousBlockQuery[0].total_difficulty_cuckatoo;
        var targetdifficultyprogpow =
          BlockchainLatestBlockQuery[0].total_difficulty_progpow -
          BlockchainPreviousBlockQuery[0].total_difficulty_progpow;
        var targetdifficultyrandomx =
          BlockchainLatestBlockQuery[0].total_difficulty_randomx -
          BlockchainPreviousBlockQuery[0].total_difficulty_randomx;
      }

      block_height = BlockchainLatestBlockQuery[0].height;
      var TotalCuckoo=parseInt(BlockchainLatestBlockQuery[0].total_difficulty_cuckatoo) +
                      parseInt(BlockchainLatestBlockQuery[0].total_difficulty_cuckaroo);

      response.status(200).json({
        status: 200,
        timestamp: Date.now(),
        message: 'Latest Block Details fetched Successfully',
        response: {
          block_height,
          letest_block,
          letest_block_num,
          letest_block_duration,
          coin_existence,
          difficulty,
          targetdifficultycuckaroo,
          targetdifficultycuckatoo,
          targetdifficultyprogpow,
          targetdifficultyrandomx,
          TotalCuckoo,
          TotalDifficultyCuckaroo:BlockchainLatestBlockQuery[0].total_difficulty_cuckaroo,
          TotalDifficultyCuckatoo:BlockchainLatestBlockQuery[0].total_difficulty_cuckatoo,
          TotalDifficultyProgpow:BlockchainLatestBlockQuery[0].total_difficulty_progpow,
          TotalDifficultyRandomx:BlockchainLatestBlockQuery[0].total_difficulty_randomx
        },
      });
    } catch (error) {
      next(new InternalServerErrorException(error));
    }
  };

  private BlockchainBlockPerSecond = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => {
    try {
      const BlockchainBlockPerSecondData: TotalDifficultyNBlockDto =
        request.query;
      if (BlockchainBlockPerSecondData.Interval) {
        var timeIntervalQry =
          "timestamp > current_date - interval '" +
          BlockchainBlockPerSecondData.Interval +
          "'";
      } else if (
        BlockchainBlockPerSecondData.FromDate ||
        BlockchainBlockPerSecondData.ToDate
      ) {
        let fromdate = moment(BlockchainBlockPerSecondData.FromDate)
          .utc()
          .format('YYYY-MM-DD');
        let todate = moment(BlockchainBlockPerSecondData.ToDate)
          .utc()
          .format('YYYY-MM-DD');

        var timeIntervalQry =
          'timestamp BETWEEN SYMMETRIC ' + fromdate + ' AND ' + todate;
      } else {
        var timeIntervalQry = "timestamp > current_date - interval '30 days'";
      }
      const BlockchainBlockPerSecondQuery = await getConnection()
        .query(
          "select date(DATE_TRUNC('day', timestamp)) as date, count(hash) as blocks, 86400/count(hash) as period \
        from blockchain_block where " +
          timeIntervalQry +
          "group by DATE_TRUNC('day', timestamp) order by date",
        )
        .catch(err_msg => {
          next(err_msg);
        });

      let date = [],
        period = [];
      BlockchainBlockPerSecondQuery.forEach(e => {
        date.push(moment(e.date).format('YYYY-MM-DD'));
        period.push(parseInt(e.period));
      });
      response.status(200).json({
        status: 200,
        timestamp: Date.now(),
        message: 'period of blocks generation per second fetched Successfully',
        response: {
          date,
          period,
        },
      });
    } catch (error) {
      next(new InternalServerErrorException(error));
    }
  };

  private SupplyGrowth = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => {
    try {
      const BlockchainBlockPerSecondData: TotalDifficultyNBlockDto =
        request.query;
      if (BlockchainBlockPerSecondData.Interval) {
        var timeIntervalQry =
          "timestamp > current_date - interval '" +
          BlockchainBlockPerSecondData.Interval +
          "'";
      } else if (
        BlockchainBlockPerSecondData.FromDate ||
        BlockchainBlockPerSecondData.ToDate
      ) {
        let fromdate = moment(BlockchainBlockPerSecondData.FromDate)
          .utc()
          .format('YYYY-MM-DD');
        let todate = moment(BlockchainBlockPerSecondData.ToDate)
          .utc()
          .format('YYYY-MM-DD');

        var timeIntervalQry =
          'timestamp BETWEEN SYMMETRIC ' + fromdate + ' AND ' + todate;
      } else {
        var timeIntervalQry = "timestamp > current_date - interval '30 days'";
      }
      const BlockchainBlockPerSecondQuery = await getConnection()
        .query(
          'select x.timestamp, SUM(x.reward) as total_reward_per_day \
        from (SELECT hash, height, CAST(timestamp AS DATE), \
        CASE \
            WHEN height <= 1440 THEN 200 \
            WHEN height <= 2880 THEN 180 \
            WHEN height <= 4320 THEN 160 \
            WHEN height <= 5760 THEN 140 \
            WHEN height <= 7200 THEN 120 \
            WHEN height <= 8640 THEN 100 \
            WHEN height <= 10080 THEN 80 \
            WHEN height <= 11520 THEN 60 \
            WHEN height <= 12960 THEN 50 \
            ELSE 25 \
        END AS reward \
        FROM blockchain_block where ' +
          timeIntervalQry +
          ') as x group by x.timestamp Order by x.timestamp ASC',
        )
        .catch(err_msg => {
          next(err_msg);
        });

      let date = [],
        total_reward_per_day = [],
        addedreward = [],
        prev_value = 0;

      BlockchainBlockPerSecondQuery.forEach(e => {
        date.push(moment(e.timestamp).format('YYYY-MM-DD'));
        total_reward_per_day.push(parseInt(e.total_reward_per_day));
        addedreward.push(prev_value + parseInt(e.total_reward_per_day));
        prev_value = prev_value + parseInt(e.total_reward_per_day);
      });
      response.status(200).json({
        status: 200,
        timestamp: Date.now(),
        message: 'period of blocks generation per second fetched Successfully',
        response: {
          date,
          total_reward_per_day,
          addedreward,
        },
      });
    } catch (error) {
      next(new InternalServerErrorException(error));
    }
  };

  private BlockMineChart = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => {
    try {
      const BlockchainBlockPerSecondData: TotalDifficultyNBlockDto =
        request.query;
      if (BlockchainBlockPerSecondData.Interval) {
        var timeIntervalQry =
          "timestamp at time zone '" +
          process.env.TIME_ZONE +
          "' > current_date - interval '" +
          BlockchainBlockPerSecondData.Interval +
          "'";
      } else if (
        BlockchainBlockPerSecondData.FromDate ||
        BlockchainBlockPerSecondData.ToDate
      ) {
        let fromdate = moment(BlockchainBlockPerSecondData.FromDate)
          .utc()
          .format('YYYY-MM-DD');
        let todate = moment(BlockchainBlockPerSecondData.ToDate)
          .utc()
          .format('YYYY-MM-DD');

        var timeIntervalQry =
          "timestamp at time zone '" +
          process.env.TIME_ZONE +
          "' BETWEEN SYMMETRIC '" +
          fromdate +
          "' AND '" +
          todate +
          "'";
      } else {
        var timeIntervalQry =
          "timestamp at time zone '" +
          process.env.TIME_ZONE +
          "' > current_date - interval '30 days'";
      }
      const BlockMineChartQuery = await getConnection()
        .query(
          "SELECT hash, date , total_edge_bits, RandomX, Cuckoo, ProgPow, Round(RandomX * 100.0 / total_edge_bits,2) AS RandomXper,  Round(Cuckoo * 100.0 / total_edge_bits,2) AS Cuckooper, Round(ProgPow * 100.0 / total_edge_bits,2) AS ProgPowper \
        FROM   (SELECT    1 as hash, \
                          date(DATE_TRUNC('day', timestamp at time zone '" +
          process.env.TIME_ZONE +
          "')) as date, \
                          COUNT(edge_bits) AS total_edge_bits, \
                          Count( CASE WHEN proof = 'RandomX' THEN 1 ELSE NULL END) AS RandomX, \
                          Count( CASE  WHEN proof = 'Cuckoo' THEN 1 ELSE NULL END) AS Cuckoo,\
                          Count( CASE WHEN proof = 'ProgPow' THEN 1 ELSE NULL END) AS ProgPow \
                 FROM     blockchain_block \
                 where " +
          timeIntervalQry +
          "GROUP BY DATE_TRUNC('day', timestamp at time zone '" +
          process.env.TIME_ZONE +
          "')) t order by date",
        )
        .catch(err_msg => {
          next(err_msg);
        });
      let date = [],
        RandomXper = [],
        Cuckooper = [],
        ProgPowper = [],
        RandomX = [],
        Cuckoo = [],
        ProgPow = [];

      BlockMineChartQuery.forEach(e => {
        date.push(moment(e.date).format('YYYY-MM-DD'));
        RandomXper.push(parseFloat(e.randomxper));
        Cuckooper.push(parseFloat(e.cuckooper));
        ProgPowper.push(parseFloat(e.progpowper));
        RandomX.push(parseInt(e.randomx));
        Cuckoo.push(parseInt(e.cuckatoo));
        ProgPow.push(parseInt(e.progpow));
      });

      response.status(200).json({
        status: 200,
        timestamp: Date.now(),
        message: 'period of blocks generation per second fetched Successfully',
        response: {
          date,
          RandomXper,
          Cuckooper,
          ProgPowper,
          RandomX,
          Cuckoo,
          ProgPow
        },
      });
    } catch (error) {
      next(new InternalServerErrorException(error));
    }
  };
}
