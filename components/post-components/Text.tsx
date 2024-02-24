import styles from './style.module.css'

export const GradientText = (props) => {
  const { children } = props || {}
  return (
    <>
      <span className={styles['gradient-text']}>{children}</span>
    </>
  )
}

export const DitherText = (props) => {
  const { children } = props || {}
  return <span className={styles['dither-text']}>{children}</span>
}
