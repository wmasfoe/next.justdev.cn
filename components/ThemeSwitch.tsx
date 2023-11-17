'use client'
/* eslint-disable jsx-a11y/label-has-associated-control, jsx-a11y/no-static-element-interactions, jsx-a11y/label-has-for */
import {
  useEffect,
  useState,
  useLayoutEffect,
  useSyncExternalStore,
  MouseEvent,
  TouchEvent,
  KeyboardEvent,
} from 'react'
import { useTheme } from 'next-themes'
import '../css/ThemeSwitch.css'

function useSystemTheme() {
  const mediaQueryListDark = window?.matchMedia('(prefers-color-scheme: dark)')

  function getSnapshot() {
    return mediaQueryListDark.matches ? 'dark' : 'light'
  }
  function subscribe(callback) {
    mediaQueryListDark.addEventListener('change', callback)
    return () => {
      mediaQueryListDark.removeEventListener('change', callback)
    }
  }
  const theme = useSyncExternalStore(subscribe, getSnapshot)
  return theme
}

const ThemeSwitch = () => {
  const [mounted, setMounted] = useState(false)
  const systemTheme = useSystemTheme()
  const { theme: nextTheme, setTheme: setNextTheme, resolvedTheme: resolvedNextTheme } = useTheme()

  // When mounted on client, now we can show the UI
  useEffect(() => setMounted(true), [])

  useLayoutEffect(() => {
    setNextTheme(systemTheme)
  }, [setNextTheme, systemTheme])

  const changeTheme = (event: MouseEvent | TouchEvent | KeyboardEvent) => {
    setNextTheme(nextTheme === 'dark' ? 'light' : 'dark')
    event.preventDefault()
  }

  if (!mounted) {
    return null
  }

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events
    <div
      className="color-scheme-switch-wrapper"
      aria-label="Toggle Dark Mode"
      onClick={changeTheme}
    >
      <input
        type="checkbox"
        name="color-scheme-switch"
        id="color-scheme-switch"
        checked={nextTheme === 'dark'}
        className="color-scheme-switch"
        onChange={() => {}}
      />
      <label htmlFor="color-scheme-switch" />
    </div>
  )
}

export default ThemeSwitch
