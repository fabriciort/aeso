import Image from 'next/image'
import Link from 'next/link'

interface CardProps {
  title: string
  description: string
  link: string
  image: string
}

export default function Card({ title, description, link, image }: CardProps) {
  return (
    <div className="bg-white dark:bg-zinc-800/80 rounded-xl overflow-hidden shadow-lg 
                    hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative h-48">
        <Image
          src={`/assets/card/${image}`}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="p-6">
        <h2 className="text-xl font-bold mb-3 text-neutral-800 dark:text-neutral-200">{title}</h2>
        <p className="text-neutral-600 dark:text-neutral-400 mb-4">{description}</p>
        <Link 
          href={link}
          className="inline-flex items-center text-green-700 dark:text-green-400 
                     hover:text-green-600 dark:hover:text-green-300 font-medium"
        >
          Saiba mais
          <span className="ml-2">→</span>
        </Link>
      </div>
    </div>
  )
} 