import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { retry, catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Product } from './product';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

private SERVER_URL = 'http://localhost:3000/products';
  public next:   string = '';
  public first:  string = '';
  public prev:   string = '';
  public last:   string = '';

  constructor(private httpClient: HttpClient) { }

  handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unknown error!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    window.alert(errorMessage);
    return throwError(errorMessage);
  }

  public sendGetRequest() {
    return this.httpClient
                  .get<Product[]>(
                        this.SERVER_URL, {
                          params: new HttpParams({
                            fromString: '_page=1&_limit=20'
                          }), observe: 'response'
                        }).pipe(
                            retry(3), catchError(this.handleError),
                            tap(res => {
                                          console.log(res.headers.get('Link'));
                                          this.parseLinkHeader(
                                                  res.headers.get('Link')
                                          );
                                        }
                                  )
                            );
  }

  parseLinkHeader( header: string ) {
    if (header.length === 0) {
      return ;
    }

    const parts = header.split(',');
    const links = {};

    parts.forEach( p => {
      const section = p.split(';');
      const url = section[0].replace(/<(.*)>/, '$1').trim();
      const name = section[1].replace(/rel="(.*)"/, '$1').trim();
      links[name] = url;

    });

    this.first  = links['first'];
    this.last   = links['last'];
    this.prev   = links['prev'];
    this.next   = links['next'];

  }

  public sendGetRequestToUrl(url: string) {
    return this.httpClient
                    .get<Product[]>(
                          url, {
                                  observe: 'response'
                                })
                                  .pipe(retry(3), catchError(this.handleError),
                                          tap(res => {
                                                        console.log(res.headers.get('Link'));
                                                        this.parseLinkHeader(
                                                          res.headers.get('Link')
                                                        );
                                                      })
                                        );
  }

}
