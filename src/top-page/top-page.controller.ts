import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Logger,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jst.guard';
import { HhService } from 'src/hh/hh.service';
import { IdValidationPipe } from 'src/pipes/id-validation.pipe';
import { CreateTopPageDto } from './dto/create.top-page.dto';

import { FindTopPageDto } from './dto/find-top-page.dto';
import { NOT_FOUND_TOPPAGE } from './top-page.constants';

import { TopPageService } from './top-page.service';

@Controller('top-page')
export class TopPageController {
  constructor(
    private readonly topPageService: TopPageService,
    private readonly hhService: HhService,
  ) {}
  @UseGuards(JwtAuthGuard)
  @Post('create')
  async create(@Body() dto: CreateTopPageDto) {
    return this.topPageService.create(dto);
  }
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id', IdValidationPipe) id: string) {
    const deletedPage = await this.topPageService.delete(id);
    if (!deletedPage) {
      throw new NotFoundException(NOT_FOUND_TOPPAGE);
    }
  }
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async get(@Param('id', IdValidationPipe) id: string) {
    const page = await this.topPageService.findById(id);
    if (!page) {
      throw new NotFoundException(NOT_FOUND_TOPPAGE);
    }
    return page;
  }
  @Get('byAlias/:alias')
  async getByAlias(@Param('alias') alias: string) {
    const page = await this.topPageService.findByAlias(alias);
    if (!page) {
      throw new NotFoundException(NOT_FOUND_TOPPAGE);
    }
    return page;
  }
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id', IdValidationPipe) id: string,
    @Body() dto: CreateTopPageDto,
  ) {
    const updatedPage = await this.topPageService.update(id, dto);
    if (!updatedPage) {
      throw new NotFoundException(NOT_FOUND_TOPPAGE);
    }
    return updatedPage;
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('find')
  async find(@Body() dto: FindTopPageDto) {
    return this.topPageService.findByCategory(dto.firstCategory);
  }
  @Get('textSearch/:text')
  async textSearch(@Param('text') text: string) {
    return this.topPageService.findByText(text);
  }
  @HttpCode(200)
  @Post('test')
  async test() {
    const data = await this.topPageService.findForHhUpdate(new Date());
    Logger.log(data);
    for (const page of data) {
      const hhData = await this.hhService.getData(page.category);
      Logger.log(hhData);
      page.hh = hhData;
      await this.topPageService.update(page._id, page);
    }
  }
}
