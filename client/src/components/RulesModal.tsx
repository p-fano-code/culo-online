import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { RULES_PAGES } from '../game/rulesContent';
import './RulesModal.css';

interface RulesModalProps {
  open: boolean;
  onClose: () => void;
}

export function RulesModal({ open, onClose }: RulesModalProps) {
  const [page, setPage] = useState(0);
  const [wasOpen, setWasOpen] = useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setPage(0);
  }

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const goTo = (index: number) => setPage(Math.max(0, Math.min(RULES_PAGES.length - 1, index)));
  const current = RULES_PAGES[page];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="rules-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="rules-modal"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rules-header">
              <h2>Reglas del Culo</h2>
              <button type="button" className="rules-close" onClick={onClose} aria-label="Cerrar">
                ✕
              </button>
            </div>

            <div className="rules-body">
              <h3>{current.title}</h3>
              {current.paragraphs.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
              {current.list && (
                <ul>
                  {current.list.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rules-footer">
              <button type="button" className="secondary" onClick={() => goTo(page - 1)} disabled={page === 0}>
                Anterior
              </button>
              <div className="rules-pages">
                {RULES_PAGES.map((rulesPage, i) => (
                  <button
                    key={rulesPage.title}
                    type="button"
                    className={`rules-dot${i === page ? ' active' : ''}`}
                    onClick={() => goTo(i)}
                    aria-label={`Página ${i + 1}: ${rulesPage.title}`}
                  />
                ))}
              </div>
              <button type="button" onClick={() => goTo(page + 1)} disabled={page === RULES_PAGES.length - 1}>
                Siguiente
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
