import Head from 'next/head'
import Layout from '../components/navigation/layout'
import { ConversationContextProvider } from '@/components/context/ConversationProvider'
import 'react-loading-skeleton/dist/skeleton.css'
import 'react-datepicker/dist/react-datepicker.css'
import '../styles/globals.css'
import { UserProvider } from '@auth0/nextjs-auth0/client'
import { Inter, Rubik } from 'next/font/google'
import Meeting from '@/components/zoom/ZoomMeeting'
import FloatingMeetingIndicator from '@/components/ui/PetDetails/MeetingLayout/FloatingMeetingIndicator'


const inter = Inter({ subsets: ['latin'] })
const rubik = Rubik({ subsets: ['latin'] })

export default function App({ Component, pageProps }) {
  return (
    <>
      <UserProvider>
        <Head>
          <meta
            name='viewport'
            content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
          />
          {/* Add any other global meta tags or links here */}
        </Head>
        <ConversationContextProvider>
          <Layout>
          
            <main className={`${inter.className}`}>
              <Meeting/>
              <Component {...pageProps} />
               <FloatingMeetingIndicator />
            </main>
            
          </Layout>
        </ConversationContextProvider>
      </UserProvider>
    </>
  )
}





// import Head from 'next/head'
// import Layout from '../components/navigation/layout'
// import { ConversationContextProvider } from '@/components/context/ConversationProvider'
// import 'react-loading-skeleton/dist/skeleton.css'
// import 'react-datepicker/dist/react-datepicker.css'
// import '../styles/globals.css'
// import { UserProvider } from '@auth0/nextjs-auth0/client'
// import { Inter, Rubik } from 'next/font/google'
// import PersistentLayout from '@/components/navigation/PersistentLayout'

// const inter = Inter({ subsets: ['latin'] })
// const rubik = Rubik({ subsets: ['latin'] })

// export default function App({ Component, pageProps }) {
//   return (
//     <>
//       <UserProvider>
//         <Head>
//           <meta
//             name='viewport'
//             content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
//           />
//         </Head>
//         <ConversationContextProvider>
//           <Layout>
//             <PersistentLayout>
//               <main className={`${inter.className}`}>
//                 <Component {...pageProps} />
//               </main>
//             </PersistentLayout>
//           </Layout>
//         </ConversationContextProvider>
//       </UserProvider>
//     </>
//   )
// }