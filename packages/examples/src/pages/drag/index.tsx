import { useState } from 'react';
import './styles.css';

function Card() {
  const [isDragging, setIsDragging] = useState(false);

  function handleDragStart(e: any) {
    setIsDragging(true);
    const data = JSON.stringify({ type: 'card' });
    e.dataTransfer.setData('text/plain', data);
  }

  function handleDragEnd(e: any) {
    setIsDragging(false);
    e.dataTransfer.clearData();
  }

  return (
    <div
      className="card"
      style={{
        backgroundColor: isDragging ? '#fbb' : 'palegoldenrod',
      }}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      Card
    </div>
  );
}

function Box({ card, moveCard, index }: { card: boolean; moveCard: Function; index: number }) {
  const [isOver, setIsOver] = useState(false);

  function handleDragOver(e: any) {
    console.log(`${index},handleDragOver`, e.dataTransfer.types[0]);
    if (e.dataTransfer.types[0] === 'text/plain') {
      setIsOver(true);
      e.preventDefault();
    }
  }

  function handleDrop(e: any) {
    const dataJSON = e.dataTransfer.getData('text/plain');
    console.log(`${index},handleDrop`);
    let data;
    try {
      data = JSON.parse(dataJSON);
    } catch {}
    if (data && data.type === 'card') {
      moveCard();
    }
  }

  function handleDragLeave() {
    setIsOver(false);
    console.log(`${index},handleDragLeave`);
  }

  return (
    <div
      className="box"
      style={{ backgroundColor: isOver ? '#bbf' : 'rgba(0,0,0,.12)' }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={handleDragLeave}
    >
      {card ? <Card /> : 'Box'}
    </div>
  );
}

function Page() {
  const [index, setIndex] = useState(1);

  function moveCard(i: any) {
    setIndex(i);
  }

  return (
    <div className="app">
      <Box card={index === 1} index={1} moveCard={moveCard.bind(null, 1)}></Box>
      <Box card={index === 2} index={2} moveCard={moveCard.bind(null, 2)}></Box>
      <Box card={index === 3} index={3} moveCard={moveCard.bind(null, 3)}></Box>
    </div>
  );
}

export default Page;
