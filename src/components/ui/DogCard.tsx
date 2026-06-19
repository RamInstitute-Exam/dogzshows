import React from 'react';
import { MapPin, Heart } from 'lucide-react';
import Link from 'next/link';

interface DogCardProps {
  id: string;
  name: string;
  breed: string;
  age: string;
  price: number | string;
  imageUrl: string;
  location?: string;
  featured?: boolean;
}

const DogCard: React.FC<DogCardProps> = ({
  id,
  name,
  breed,
  age,
  price,
  imageUrl,
  location = "Bangalore, India",
  featured = false
}) => {
  return (
    <Link href={`/dogs/detail?id=${id}`} className="group block h-full">
      <div className="glass-panel overflow-hidden rounded-[2rem] premium-hover h-full flex flex-col relative">
        
        {/* Image Section */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {/* Skeleton/Placeholder fallback if image fails, handled by using a div background or object-cover */}
          <img 
            src={imageUrl || "/images/contact_banner.png"} 
            alt={name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          
          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-transparent to-transparent opacity-80" />
          
          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {featured && (
              <span className="bg-brand-gold text-brand-dark text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                Featured
              </span>
            )}
          </div>
          <button className="absolute top-4 right-4 p-2 bg-card/20 backdrop-blur-md rounded-full text-foreground hover:text-foreground transition-colors hover:bg-card/40">
            <Heart size={20} />
          </button>

          {/* Bottom Info inside Image */}
          <div className="absolute bottom-4 left-4 right-4 text-foreground">
            <h3 className="text-2xl font-bold font-sans">{name}</h3>
            <p className="text-sm text-foreground/90 font-medium">{breed}</p>
          </div>
        </div>

        {/* Details Section */}
        <div className="p-5 flex flex-col flex-grow bg-card">
          <div className="flex justify-between items-center mb-4">
            <span className="text-brand-gray text-sm font-medium">{age}</span>
            <span className="text-foreground font-extrabold text-lg">
              {typeof price === 'number' ? `₹${price.toLocaleString()}` : price}
            </span>
          </div>
          
          <div className="flex items-center text-brand-gray/80 text-sm mt-auto pt-4 border-t border-border">
            <MapPin size={16} className="mr-1 text-muted-foreground" />
            {location}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default DogCard;
