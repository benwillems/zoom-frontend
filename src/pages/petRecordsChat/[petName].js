import { Inter } from 'next/font/google'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router';

const Textarea = dynamic(() => import('../../components/chat/Textarea'))
const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const router = useRouter();
  const { petName } = router.query;
  let footerLinks = [
    { name: 'Try Pro', href: '#', newWindow: true },
    { name: 'About', href: '#', newWindow: false },
    { name: 'Blog', href: '#', newWindow: false },
    { name: 'Privacy Policy', href: '#', newWindow: false },
    { name: 'Terms of Service', href: '#', newWindow: false },
  ]

  return (
    <main
      className={`flex h-full flex-col items-center justify-between p-4 ${inter.className}`}
    >
      <div className='flex-grow flex flex-col justify-center items-center'>
        <div className='mb-4'>
          <h1 className='text-zinc-600 dark:text-primary-white text-lg lg:text-xl xl:text-3xl font-medium'>
            Ask me anything about {petName}
          </h1>
        </div>
        <div className='mb-4 w-[24rem] lg:w-[30rem] xl:w-[42rem] bg-white dark:bg-secondary-dark rounded-md shadow-md outline outline-[0.5px] dark:text-primary-white outline-zinc-300 dark:outline-primary-dark-light flex flex-col'>
          <Textarea petName={petName}/>
        </div>
      </div>

      {/* Footer - USE LATER */}
      {/* <div className='w-full h-14 flex items-center text-sm justify-center text-zinc-500 space-x-4'>
        {footerLinks.map((link, index) => (
          <a
            key={index}
            href={link.href}
            target={link.newWindow ? '_blank' : '_self'}
            rel={link.newWindow ? 'noopener noreferrer' : ''}
            className={`${
              index === 0 ? 'text-green-500' : 'text-zinc-500'
            } cursor-pointer hover:underline`}
          >
            {link.name}
          </a>
        ))}
      </div> */}
    </main>
  )
}
