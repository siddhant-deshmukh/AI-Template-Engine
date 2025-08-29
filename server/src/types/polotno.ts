export type ElementType = 'svg' | 'image' | 'text'

export interface IPolotnoChild {
  id: string;
  type: ElementType;
  colorReplace: { [key: string]: string };
  [key: string]: any;
}

export interface IPolotnoPage {
  id: string;
  children: IPolotnoChild[];
  background: string;
}

export interface IPolotnoJSON {
  width: number;
  height: number;
  fonts: string[];
  pages: IPolotnoPage[];
}
