declare module "*.svg" {
  import React from "react";
  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement>
  >;
  const src: string;
  export default src;
}

declare const acquireVsCodeApi: () => {
  postMessage(message: any): void;
  getState(): any;
  setState(state: any): void;
};
