
import BackgroundSlideshow from './BackgroundSlideshow';
import Wave from './Wave';
function Main() {
  return (
    <section className="relative h-screen overflow-hidden">
      <div className="absolute inset-0 -z-0">
        <BackgroundSlideshow />
      </div>
      <div className="z-10 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8 relative pt-20">
        <div className="max-w-2xl text-left space-y-6">
          <span className="px-3 py-1 text-xs font-semibold text-white rounded-full bg-white/10 backdrop-blur-sm inline-block">
            Discover Morocco with AI
          </span>
          
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Your Journey Through
            <span className="block text-sahara-red mt-2">
              Magical Morocco
            </span>
          </h1>
          
          <p className="text-lg text-white/80 font-light max-w-xl">
            Let AI craft your perfect Moroccan adventure. From the blue streets of Chefchaouen to the 
            Sahara's golden dunes, experience Morocco like never before.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:items-center pt-4">
            <a
              href="#"
              className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium text-white bg-sahara-red rounded-xl hover:bg-sahara-red/90 transition-all duration-200 shadow-lg shadow-sahara-red/25"
            >
              Start Planning
            </a>

            <a
              href="#"
              className="inline-flex items-center justify-center px-6 py-3 text-lg font-medium text-white border-2 border-white/20 rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 18 18" fill="none" stroke="currentColor">
                <path
                  d="M8.18003 13.4261C6.8586 14.3918 5 13.448 5 11.8113V5.43865C5 3.80198 6.8586 2.85821 8.18003 3.82387L12.5403 7.01022C13.6336 7.80916 13.6336 9.44084 12.5403 10.2398L8.18003 13.4261Z"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Watch Video
            </a>
          </div>

          <div className="pt-1 border-t border-white/10">
            <p className="text-sm text-white/60 ">
              Trusted by thousands of travelers · No credit card required
            </p>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 z-30">
        <Wave />
      </div>
    </section>
  )
}

export default Main