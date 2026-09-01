import { Component } from '@angular/core';
import { Header } from '../../components/home-page-components/header/header';
import { Hero } from '../../components/home-page-components/hero/hero';
import { Services } from '../../components/home-page-components/services/services';
import { About } from '../../components/home-page-components/about/about';
import { Events } from '../../components/home-page-components/events/events';
import { ContactUs } from '../../components/home-page-components/contact-us/contact-us';
import { Team } from '../../components/home-page-components/team/team';
import { RequestEventCta } from '../../components/home-page-components/request-event-cta/request-event-cta';
import { Process } from '../../components/home-page-components/process/process';
import { Footer } from '../../components/home-page-components/footer/footer';
import { Locations } from '../../components/home-page-components/locations/locations';

@Component({
  selector: 'app-home',
  imports: [
    Header,
    Hero,
    Services,
    About,
    Events,
    RequestEventCta,
    Process,
    Team,
    Locations,
    ContactUs,
    Footer,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {

}
