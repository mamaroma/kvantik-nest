import { Body, Controller, Get, Inject, Post, Query, Render, Req, Res } from '@nestjs/common';
import { ApiBody, ApiCookieAuth, ApiExcludeController, ApiOperation } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AUTH_OPTIONS } from './auth.constants';
import { AuthModuleOptions } from './auth.interfaces';
import { PublicAccess } from './decorators/public-access.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';

@ApiExcludeController()
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        @Inject(AUTH_OPTIONS) private readonly options: AuthModuleOptions,
    ) {}

    @PublicAccess()
    @Get('login')
    @Render('auth/login')
    loginPage(@Query('returnTo') returnTo?: string) {
        return {
            pageTitle: 'Квантик — Вход',
            activePage: 'login',
            session: { isAuthed: false },
            returnTo: returnTo || '/mvc',
            error: null,
        };
    }

    @PublicAccess()
    @Get('register')
    @Render('auth/register')
    registerPage(@Query('returnTo') returnTo?: string) {
        return {
            pageTitle: 'Квантик — Регистрация',
            activePage: 'register',
            session: { isAuthed: false },
            returnTo: returnTo || '/mvc',
            error: null,
        };
    }

    @PublicAccess()
    @Post('login')
    @ApiOperation({ summary: 'Выполнить вход и получить auth cookie' })
    @ApiBody({ type: LoginDto })
    async login(@Body() dto: LoginDto, @Query('returnTo') returnTo: string | undefined, @Res() res: Response) {
        try {
            const user = await this.authService.login(dto);
            const token = this.authService.issueToken(user);
            res.cookie(this.options.cookieName, token, {
                httpOnly: true,
                sameSite: this.options.cookieSameSite,
                secure: this.options.cookieSecure,
                maxAge: this.options.cookieMaxAgeMs,
                path: '/',
            });
            return res.redirect(returnTo || '/mvc');
        } catch (error) {
            return res.status(401).render('auth/login', {
                pageTitle: 'Квантик — Вход',
                activePage: 'login',
                session: { isAuthed: false },
                returnTo: returnTo || '/mvc',
                error: error instanceof Error ? error.message : 'Не удалось выполнить вход',
            });
        }
    }

    @PublicAccess()
    @Post('register')
    @ApiOperation({ summary: 'Зарегистрировать пользователя' })
    @ApiBody({ type: RegisterDto })
    async register(@Body() dto: RegisterDto, @Query('returnTo') returnTo: string | undefined, @Res() res: Response) {
        try {
            const user = await this.authService.register(dto);
            const token = this.authService.issueToken(user);
            res.cookie(this.options.cookieName, token, {
                httpOnly: true,
                sameSite: this.options.cookieSameSite,
                secure: this.options.cookieSecure,
                maxAge: this.options.cookieMaxAgeMs,
                path: '/',
            });
            return res.redirect(returnTo || '/mvc');
        } catch (error) {
            return res.status(400).render('auth/register', {
                pageTitle: 'Квантик — Регистрация',
                activePage: 'register',
                session: { isAuthed: false },
                returnTo: returnTo || '/mvc',
                error: error instanceof Error ? error.message : 'Не удалось зарегистрироваться',
            });
        }
    }

    @ApiCookieAuth('kvantik-auth')
    @Post('logout')
    async logout(@Query('returnTo') returnTo: string | undefined, @Res() res: Response) {
        res.clearCookie(this.options.cookieName, { path: '/' });
        return res.redirect(returnTo || '/mvc');
    }

    @Get('me')
    @ApiCookieAuth('kvantik-auth')
    me(@Req() req: Request) {
        return req.authUser;
    }
}
