import { useRef } from 'react'

export function useUpdatedRef<T>(value: T) {
  const ref = useRef<T>(value)
  ref.current = value
  return ref
}