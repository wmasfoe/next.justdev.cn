'use client'
/* eslint-disable jsx-a11y/label-has-associated-control, jsx-a11y/no-static-element-interactions, jsx-a11y/label-has-for */
import { useEffect, useState, useLayoutEffect, MouseEvent, TouchEvent, KeyboardEvent } from 'react'
import { useTheme } from 'next-themes'
import '../css/ThemeSwitch.css'

const ThemeSwitch = () => {
  const [mounted, setMounted] = useState(false)
  const { theme: nextTheme, setTheme: setNextTheme, resolvedTheme: resolvedNextTheme } = useTheme()

  // When mounted on client, now we can show the UI
  useEffect(() => setMounted(true), [])

  const [theme, setTheme] = useState('wait')

  useLayoutEffect(() => {
    const mediaQueryListDark = window.matchMedia('(prefers-color-scheme: dark)')

    function handleChange() {
      const theme = mediaQueryListDark.matches ? 'dark' : 'light'
      setTheme(theme)
      setNextTheme(theme)
    }

    handleChange()

    mediaQueryListDark.addEventListener('change', handleChange)
    return () => {
      mediaQueryListDark.removeEventListener('change', handleChange)
    }
  }, [setNextTheme])

  const changeTheme = (event: MouseEvent | TouchEvent | KeyboardEvent) => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
    setNextTheme(theme === 'dark' ? 'light' : 'dark')
    event.preventDefault()
  }

  if (!mounted) {
    return null
  }

  return (
    <div
      className="color-scheme-switch-wrapper"
      aria-label="Toggle Dark Mode"
      onClick={changeTheme}
    >
      <input
        type="checkbox"
        name="color-scheme-switch"
        id="color-scheme-switch"
        checked={theme === 'dark' || nextTheme === 'dark'}
        className="color-scheme-switch"
        onChange={() => {}}
      />
      <label htmlFor="color-scheme-switch" />
    </div>
  )
}

export default ThemeSwitch
