import { motion } from 'framer-motion'
import { Check } from '@phosphor-icons/react'

export function SuccessAnimation() {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className="fixed inset-0 pointer-events-none flex items-center justify-center z-50"
    >
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 10, -10, 0]
        }}
        transition={{ duration: 0.5 }}
        className="bg-success text-success-foreground rounded-full p-8 shadow-2xl"
      >
        <Check size={64} weight="bold" />
      </motion.div>
      
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: 0, 
            y: 0, 
            scale: 1,
            opacity: 1 
          }}
          animate={{
            x: Math.cos((i * Math.PI * 2) / 12) * 200,
            y: Math.sin((i * Math.PI * 2) / 12) * 200,
            scale: 0,
            opacity: 0
          }}
          transition={{
            duration: 0.8,
            ease: 'easeOut'
          }}
          className="absolute w-3 h-3 rounded-full bg-accent"
        />
      ))}
    </motion.div>
  )
}
