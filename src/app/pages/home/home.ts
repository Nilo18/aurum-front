import { Component } from '@angular/core';
import { Header } from '../../components/home-page-components/header/header';
import { Hero } from '../../components/home-page-components/hero/hero';
import { Services } from '../../components/home-page-components/services/services';
import { About } from '../../components/home-page-components/about/about';
import { Events } from '../../components/staff-page-components/events/events';
import { ContactUs } from '../../components/home-page-components/contact-us/contact-us';
import { Team } from '../../components/home-page-components/team/team';

@Component({
  selector: 'app-home',
  imports: [Header, Hero, Services, About, Events, Team, ContactUs],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {

}
