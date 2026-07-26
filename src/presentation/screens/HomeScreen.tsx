import React from 'react';
import { Delete } from 'lucide-react';

interface HomeScreenProps {
  input: string;
  onInputChange: (value: string) => void;
  onConfirm: (category: string, number: string) => void;
}

const CATEGORIES = ['詩歌', '補充', '新歌', '新詩', '藍本'];

export const HomeScreen: React.FC<HomeScreenProps> = ({ input, onInputChange, onConfirm }) => {
  const handleCategoryClick = (cat: string) => {
    onInputChange(`${cat}-`);
  };

  const handleNumberClick = (numStr: string) => {
    onInputChange(input + numStr);
  };

  const handleBackspace = () => {
    if (!input) return;
    const hyphenIdx = input.indexOf('-');
    if (hyphenIdx !== -1 && input.length > hyphenIdx + 1) {
      onInputChange(input.slice(0, -1));
    }
  };

  const handleConfirmClick = () => {
    const parts = input.split('-');
    if (parts.length === 2 && parts[1]) {
      onConfirm(parts[0], parts[1]);
    }
  };

  return (
    <div className="screen-root overflow-auto position-relative">
      <div className="mobile-page mx-auto d-flex flex-column px-4 px-sm-4 pt-3 pb-4">
        <div className="text-center pb-3">
          <h2 className="h4 fw-bold text-dark mb-1">點歌</h2>
          <p className="small text-secondary mb-0">選擇類別後輸入詩歌編號</p>
        </div>

        <div className="w-100 text-center pb-4 flex-shrink-0">
          <div className="home-display d-flex align-items-center justify-content-center">
            {input || ' '}
          </div>
        </div>

        <div className="d-flex flex-wrap justify-content-center gap-2 gap-sm-3 mb-4 mb-sm-5 flex-shrink-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className="category-pill btn btn-outline-success"
            >
              {cat}
            </button>
          ))}
        </div>

        <div
          className="flex-grow-1 d-flex flex-column align-items-center justify-content-center w-100 mx-auto mb-4"
          style={{ minHeight: 0 }}
        >
          <div className="keypad-grid" style={{ maxWidth: '17.5rem' }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleNumberClick(num.toString())}
                className="keypad-button btn btn-light border"
              >
                {num}
              </button>
            ))}
            <div />

            <button
              onClick={() => handleNumberClick('0')}
              className="keypad-button btn btn-light border"
            >
              0
            </button>

            <button
              onClick={handleBackspace}
              aria-label="倒退"
              className="keypad-delete"
            >
              <Delete size={30} />
            </button>
          </div>
        </div>

        <div className="mt-auto flex-shrink-0 w-100 d-flex justify-content-center pb-2">
          <button
            onClick={handleConfirmClick}
            className="confirm-button btn btn-success"
          >
            確 定
          </button>
        </div>
      </div>
    </div>
  );
};
