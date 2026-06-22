import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
    @Get()
    getHello() {
        return "Hello World!";
    }

    @Get('health')
    getHealth() {
        return "OK";
    }
}