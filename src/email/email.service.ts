/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';

@Injectable()
export class EmailService {

    transporter: Transporter

    constructor() {
        this.transporter = createTransport({
            host: "smtp.qq.com",
            port: 587,
            secure: false,
            auth: {
                user: '2791063637@qq.com',
                pass: 'itwqykkvtbrhddhf'
            },
        });
    }

    async sendMail({ to, subject, html }) {
        await this.transporter.sendMail({
            from: {
                name: '会议室预定系统',
                address: '2791063637@qq.com'
            },
            to,
            subject,
            html
        });
    }
}
