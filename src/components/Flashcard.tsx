import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Volume2 } from "lucide-react";
import { FlashcardData } from "@/data/flashcardService"; // Import the interface

interface FlashcardProps {
  flashcard: FlashcardData;
  onAnswer: (isCorrect: boolean) => void; // Changed prop name
}

// Speech Synthesis function
function speakText(text: string) {
  if ('speechSynthesis' in window) {
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US"; // Or detect language if needed
      window.speechSynthesis.cancel(); // Cancel any previous speech
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("Speech synthesis failed:", error);
      // Optionally notify the user
    }
  } else {
    console.warn("Speech synthesis not supported in this browser.");
    // Optionally notify the user
  }
}

export default function Flashcard({ flashcard, onAnswer }: FlashcardProps) {
  const [flipped, setFlipped] = useState(false);

  const handleFlip = () => {
    setFlipped(!flipped);
  };

  const handleAnswer = (isCorrect: boolean) => {
    onAnswer(isCorrect);
    setFlipped(false); // Reset flip state for the next card
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <Card
        className={`w-full max-w-md h-64 cursor-pointer transition-transform duration-500 transform-style-3d ${flipped ? 'rotate-y-180' : ''}`}
        onClick={handleFlip}
      >
        {/* Front Card Face */}
        <div className="absolute w-full h-full backface-hidden">
          <CardContent className="flex flex-col items-center justify-center h-full p-6 text-center">
            <p className="text-lg font-semibold mb-4">Question:</p>
            <p className="text-base flex-grow flex items-center">{flashcard.question}</p>
            <Button
                variant="ghost"
                size="sm"
                onClick={(e) => { e.stopPropagation(); speakText(flashcard.question); }}
                className="mt-2"
              >
                <Volume2 className="mr-2 h-4 w-4" /> Read Aloud
              </Button>
          </CardContent>
        </div>
        {/* Back Card Face */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180">
          <CardContent className="flex flex-col items-center justify-center h-full p-6 text-center bg-muted/50">
            <p className="text-lg font-semibold mb-4">Answer:</p>
            <p className="text-base flex-grow flex items-center">{flashcard.answer}</p>
             <Button
                variant="ghost"
                size="sm"
                onClick={(e) => { e.stopPropagation(); speakText(flashcard.answer); }}
                className="mt-2"
              >
                <Volume2 className="mr-2 h-4 w-4" /> Read Aloud
              </Button>
          </CardContent>
        </div>
      </Card>

      {/* Interaction Buttons */}
      <div className="flex w-full max-w-md justify-around mt-4 space-x-4">
        {flipped ? (
          <>
            {/* Correct / Incorrect Buttons */}
            <Button
              onClick={() => handleAnswer(false)} // Changed from handleStatus
              className="flex-1 bg-red-500 hover:bg-red-600 text-white"
            >
              Incorrect
            </Button>
            <Button
              onClick={() => handleAnswer(true)} // Changed from handleStatus
              className="flex-1 bg-green-500 hover:bg-green-600 text-white"
            >
              Correct
            </Button>
          </>
        ) : (
          <> 
            {/* Flip Button */}
            <Button variant="outline" onClick={handleFlip} className="flex-1">
                <RefreshCw className="mr-2 h-4 w-4" /> Flip Card
            </Button>
           </>
        )}
      </div>
    </div>
  );
}

// Add necessary CSS for the 3D flip effect in your global CSS (e.g., index.css or app.css)
/*
.transform-style-3d {
  transform-style: preserve-3d;
}
.backface-hidden {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden; 
}
.rotate-y-180 {
  transform: rotateY(180deg);
}
*/
