import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HttpClientModule, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HttpClientModule, CommonModule],
  template: `<div style="max-width:960px;margin:0 auto;padding:24px">
    <h1>{{ title }}</h1>
    <h3>Proyectos desde API</h3>
    <ul>
      <li *ngFor="let p of projects"><strong>{{ p.name }}</strong> – {{ p.description }}</li>
    </ul>
  </div>`,
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Angular Hub';
  projects: any[] = [];

  constructor(private http: HttpClient) {
    const base = (window as any).NEXT_PUBLIC_API_BASE || 'http://localhost:5000';
    this.http.get<any[]>(`${base}/api/projects`).subscribe(p => this.projects = p);
  }
}
