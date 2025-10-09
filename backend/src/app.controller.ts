import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/hello')
  getOssama(): string {
    return this.appService.getHello();
  }

  @Get('/path')
  getPath(): string {
    return this.appService.getHello();
  }
}
