import { Component } from '@angular/core';
import { LoginHero } from '../../components/login-components/login-hero/login-hero';
import { LoginForm } from '../../components/login-components/login-form/login-form';

@Component({
  selector: 'app-login',
  imports: [LoginHero, LoginForm],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {}
