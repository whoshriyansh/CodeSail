Google Serach for knowing how to enable sidebar web view
`how to make a vscode extension that open in sidebar`

Resources for tutorials
`https://www.reddit.com/r/react/comments/1cgpeli/build_a_todo_vscode_extension_using_reactjs/`
`https://dev.to/rakshit47/create-vs-code-extension-with-react-typescript-tailwind-1ba6`

Cannot find module '../assets/icons/CodeSail.svg' or its corresponding type declarations.ts(2307)
----Create a new file, for example, custom.d.ts or images.d.ts, in your project's root directory or within a src/@types folder. Add SVG Module Declaration.
Add the following code inside the newly created declaration file:
TypeScript

    declare module "*.svg" {
      import React from 'react';
      export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
      const src: string;
      export default src;
    }----

how to connect react webview to vs code api?
