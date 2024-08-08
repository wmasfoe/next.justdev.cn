import TOCInline from 'pliny/ui/TOCInline'
import Pre from 'pliny/ui/Pre'
import type { MDXComponents } from 'mdx/types'
import Image from './Image'
import CustomLink from './Link'
import { GradientText, DitherText } from './post-components/Text'
import CodePreview from './CodePreview/CodePreview'

export const components: MDXComponents = {
  Image,
  TOCInline,
  a: CustomLink,
  pre: Pre,
  DitherText,
  GradientText,
  CodePreview,
}
