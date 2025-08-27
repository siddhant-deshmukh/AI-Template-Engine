import { createStore } from 'polotno/model/store';

export type PolotnoCanvasData = ReturnType<ReturnType<typeof createStore>['toJSON']>;

export interface Template {
  name: string,
  description: string,
  width: number,
  height: number,
  canvasData: PolotnoCanvasData,
  createdAt: string,
  imgUrl?: string
}
