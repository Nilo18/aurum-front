import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EventRequestForm } from '../../components/request-event-components/event-request-form/event-request-form';
import { RequestEventIntro } from '../../components/request-event-components/request-event-intro/request-event-intro';

@Component({
  selector: 'app-request-event',
  imports: [RouterLink, EventRequestForm, RequestEventIntro],
  templateUrl: './request-event.html',
  styleUrl: './request-event.scss',
})
export class RequestEvent {}
