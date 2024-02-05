export const BREAKPOINT_SIZES = {
  xs: 320,
  sm: 540,
  md: 900,
  lg: 1024,
  xl: 1440,
}

export const syntaxTheme = {
  plain: {
    color: '#2A2A2A',
    backgroundColor: '#F6F6F6',
    borderRadius: 10,
  },
  styles: [
    {
      types: ['prolog', 'comment', 'doctype', 'cdata'],
      style: {
        color: '#B0BEC5',
      },
    },
    {
      types: ['property', 'tag', 'deleted', 'constant', 'symbol'],
      style: { color: '#f40088' },
    },
    {
      types: ['boolean', 'number'],
      style: { color: '#FF9100' },
    },
    {
      types: ['attr-name', 'tag'],
      style: { fontWeight: '700' },
    },
    {
      types: ['string', 'attr-value'],
      style: {
        color: '#78909C',
      },
    },
    {
      types: ['operator', 'entity', 'url', 'string', 'variable', 'language-css', 'keyword'],
      style: {
        color: '#651fff',
      },
    },
    {
      types: ['selector', 'attr-name', 'char', 'builtin', 'insert', 'script-punctuation'],
      style: {
        color: '#AA00FF',
      },
    },
    {
      types: ['deleted'],
      style: {
        color: 'rgb(255, 85, 85)',
      },
    },
    {
      types: ['italic'],
      style: {
        fontStyle: 'italic',
      },
    },
    {
      types: ['important', 'bold'],
      style: {
        fontWeight: 'bold',
      },
    },
    {
      types: ['regex', 'important'],
      style: {
        color: '#ffd700',
      },
    },
    {
      types: ['atrule', 'function'],
      style: {
        color: '#3D5AFE',
      },
    },
    {
      types: ['symbol'],
      style: {
        opacity: '0.7',
      },
    },
    {
      types: ['string', 'comment'],
      style: {
        fontWeight: 500,
      },
    },
  ],
}

export const BREAKPOINTS = {
  xs: `(max-width: ${BREAKPOINT_SIZES.xs}px)`,
  sm: `(max-width: ${BREAKPOINT_SIZES.sm}px)`,
  md: `(max-width: ${BREAKPOINT_SIZES.md}px)`,
  lg: `(max-width: ${BREAKPOINT_SIZES.lg}px)`,
  xl: `(max-width: ${BREAKPOINT_SIZES.xl}px)`,
  xsMin: `(min-width: ${BREAKPOINT_SIZES.xs + 1}px)`,
  smMin: `(min-width: ${BREAKPOINT_SIZES.sm + 1}px)`,
  mdMin: `(min-width: ${BREAKPOINT_SIZES.md + 1}px)`,
  lgMin: `(min-width: ${BREAKPOINT_SIZES.lg + 1}px)`,
  xlMin: `(min-width: ${BREAKPOINT_SIZES.xl + 1}px)`,
  desktop: `(min-width: ${BREAKPOINT_SIZES.sm + 1}px)`,
}
export const READING_WIDTH = 850
export const EXTRA_WIDE_WIDTH = 1024
