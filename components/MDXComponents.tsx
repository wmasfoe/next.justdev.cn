import TOCInline from 'pliny/ui/TOCInline'
import Pre from 'pliny/ui/Pre'
import type { MDXComponents } from 'mdx/types'
import Image from './Image'
import CustomLink from './Link'
import CodeBlock from './CodeBlock/index'
import Sandpack from './Sandpack'

export const components: MDXComponents = {
  Image,
  TOCInline,
  a: CustomLink,
  pre: Pre,
  CodePreview: CodeBlock,
  Sandpack,
}

for (let key in components) {
  if (components.hasOwnProperty(key)) {
    const MDXComponent: any = (components as any)[key];
    MDXComponent.mdxName = key;
  }
}
