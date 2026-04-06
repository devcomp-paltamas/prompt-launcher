import { useCallback, useRef, useState } from 'react'

export default function useAsyncAction() {
  const [pendingAction, setPendingAction] = useState('')
  const busyRef = useRef(false)

  const runAction = useCallback(async (action, callback) => {
    if (busyRef.current) {
      return false
    }

    busyRef.current = true
    setPendingAction(action)

    try {
      return await callback()
    } finally {
      busyRef.current = false
      setPendingAction('')
    }
  }, [])

  return {
    pendingAction,
    isBusy: pendingAction !== '',
    isPending: useCallback(action => pendingAction === action, [pendingAction]),
    runAction,
  }
}
