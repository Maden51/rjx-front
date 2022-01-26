/* eslint-disable no-console */
import {
  map, exhaustMap, take, catchError,
} from 'rxjs/operators';
import { interval, of } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import getTime from './time';

export default class Email {
  constructor() {
    this.container = document.querySelector('.widget-container');
    this.url = 'https://rjx.herokuapp.com/api/messages/unread';
    this.last = 0;
  }

  init() {
    this.subcription();
  }

  // eslint-disable-next-line class-methods-use-this
  render(from, subject, received, i) {
    return `
                <div class="card">
                    <div class="name">#${i} ${from}</div>
                    <div class="subject">${subject}</div>
                    <div class="data">${getTime(received)}</div>
                </div>
        `;
  }

  subcription() {
    interval(5000).pipe(
      take(3),
      exhaustMap(() => ajax.getJSON(this.url)),
      map((response) => response.messages),
      catchError((error) => {
        console.log('error: ', error);
        return of(error);
      }),
    ).subscribe((messages) => {
      this.showMessages(messages);
    });
  }

  showMessages(messages) {
    if (!this.last) {
      for (let i = this.last; i < messages.length - 1; i += 1) {
        const message = messages[i];
        if (message.subject.split('').length > 15) {
          const newStr = message.subject.substring(0, 15).padEnd(18, '...');
          message.subject = newStr;
        }
        this.container.insertAdjacentHTML(
          'afterbegin',
          (this.render(message.from, message.subject, message.received, i)),
        );
      }
    }
    this.last = messages.length - 1;
    this.showLast(messages[this.last]);
  }

  showLast(message) {
    if (message.subject.split('').length > 15) {
      const newStr = message.subject.substring(0, 15).padEnd(18, '...');
      // eslint-disable-next-line no-param-reassign
      message.subject = newStr;
    }
    this.container.insertAdjacentHTML(
      'afterbegin',
      this.render(message.from, message.subject, message.received, this.last),
    );
  }
}
