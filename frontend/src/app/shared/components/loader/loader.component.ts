import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-loader',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="flex flex-col items-center justify-center p-8">
      <div class="relative w-12 h-12">
        <div class="absolute top-0 left-0 w-full h-full border-4 border-slate-200 rounded-full"></div>
        <div class="absolute top-0 left-0 w-full h-full border-4 border-slate-800 rounded-full border-t-transparent animate-spin"></div>
      </div>
      @if (text) {
        <p class="mt-4 text-slate-500 font-medium animate-pulse">{{ text }}</p>
      }
    </div>
  `,
    styles: []
})
export class LoaderComponent {
    @Input() text: string = 'Cargando...';
}
