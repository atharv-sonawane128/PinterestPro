'use client';

import React from 'react';
import Masonry from 'react-masonry-css';
import PinCard from './PinCard';

interface Pin {
  _id?: string;
  id?: string;
  images: string[];
  title: string;
  description?: string;
  privateNote?: string;
  author: {
    name: string;
    avatar: string;
  };
}

interface MasonryGridProps {
  pins: Pin[];
  columns?: number | { [key: number]: number, default: number };
}

const MasonryGrid = ({ pins, columns }: MasonryGridProps) => {
  const breakpointColumnsObj = columns || {
    default: 5,
    1400: 4,
    1100: 3,
    800: 2,
    500: 1
  };

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="w-full">
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="my-masonry-grid flex gap-6"
        columnClassName="my-masonry-grid_column"
      >
        {pins.map((pin: any) => (
          <PinCard key={pin._id || pin.id} id={pin._id || pin.id} {...pin} />
        ))}
      </Masonry>

      <style jsx global>{`
        .my-masonry-grid {
          display: -webkit-box; /* Not needed if using flex */
          display: -ms-flexbox; /* Not needed if using flex */
          display: flex;
          margin-left: -24px; /* gutter size offset */
          width: auto;
        }
        .my-masonry-grid_column {
          padding-left: 24px; /* gutter size */
          background-clip: padding-box;
        }

        /* Style your items */
        .my-masonry-grid_column > div {
          margin-bottom: 24px;
        }
      `}</style>
    </div>
  );
};

export default MasonryGrid;
