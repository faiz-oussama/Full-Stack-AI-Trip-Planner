'use client'
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Popover,
  PopoverButton,
  PopoverGroup,
  PopoverPanel,
} from '@headlessui/react';
import { ChevronDownIcon, PhoneIcon, PlayCircleIcon } from '@heroicons/react/20/solid';
import {
  ArrowPathIcon,
  Bars3Icon,
  ChartPieIcon,
  CursorArrowRaysIcon,
  FingerPrintIcon,
  SquaresPlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import ColorThief from 'colorthief';
import { useEffect, useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import BackgroundSlideshow from "./BackgroundSlideshow";
import { AuthContext } from '@/auth/AuthProvider';

const products = [
  { name: 'Analytics', description: 'Get a better understanding of your traffic', href: '#', icon: ChartPieIcon },
  { name: 'Engagement', description: 'Speak directly to your customers', href: '#', icon: CursorArrowRaysIcon },
  { name: 'Security', description: 'Your customers data will be safe and secure', href: '#', icon: FingerPrintIcon },
  { name: 'Integrations', description: 'Connect with third-party tools', href: '#', icon: SquaresPlusIcon },
  { name: 'Automations', description: 'Build strategic funnels that will convert', href: '#', icon: ArrowPathIcon },
]

const callsToAction = [
  { name: 'Watch demo', href: '#', icon: PlayCircleIcon },
  { name: 'Contact sales', href: '#', icon: PhoneIcon },
]

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [dominantColor, setDominantColor] = useState([36, 37, 37]);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isLoginPage = location.pathname === '/login' || location.pathname === '/signup';
  const { user, logoutUser } = useContext(AuthContext);
  const navigate = useNavigate()

  // Track scroll position for enhanced header effects
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  const getHeaderStyle = () => {
    if (isHomePage) {
      return { 
        backgroundColor: `rgba(${dominantColor[0]}, ${dominantColor[1]}, ${dominantColor[2]}, 0.05)`,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      };
    }
    
    // Enhanced style for other pages with vibrant gradients and glassmorphism
    return { 
      background: scrolled
        ? `linear-gradient(135deg, rgba(99, 102, 241, 0.09), rgba(168, 85, 247, 0.08))`
        : `linear-gradient(135deg, rgba(99, 102, 241, 0.07), rgba(168, 85, 247, 0.06))`,
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      boxShadow: scrolled 
        ? '0 4px 20px -2px rgba(99, 102, 241, 0.15)' 
        : '0 2px 10px -2px rgba(99, 102, 241, 0.1)',
      borderBottom: scrolled 
        ? '1px solid rgba(99, 102, 241, 0.2)' 
        : 'none',
      transition: 'all 0.3s ease'
    };
  };

  // Add this className conditional to your nav links
  const getLinkClassName = () => {
    return isHomePage 
      ? "text-sm/6 font-semibold text-white"
      : `text-sm/6 font-semibold ${scrolled ? 'text-gray-800' : 'text-gray-700'} hover:text-indigo-600 transition-colors duration-200`;
  };

  useEffect(() => {
    const colorThief = new ColorThief();
    const updateHeaderColor = () => {
      const currentSlide = document.querySelector('.active-slide img');
      if (currentSlide && currentSlide.complete) {
        try {
          const color = colorThief.getColor(currentSlide);
          setDominantColor(color);
        } catch (e) {
          console.error('Error getting dominant color:', e);
        }
      }
    };
    // Listen for slide changes
    const observer = new MutationObserver(updateHeaderColor);
    const slideshow = document.querySelector('.slideshow-container');
    if (slideshow) {
      observer.observe(slideshow, { 
        attributes: true, 
        childList: true, 
        subtree: true 
      });
    }
    return () => observer.disconnect();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <>
      {!isLoginPage && (
        <header className={`sticky top-0 z-50 transition-all duration-500`}>
      {/* Background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {isHomePage && <BackgroundSlideshow />}
        {/* Always visible decorative background for non-homepage routes */}
        {!isHomePage && (
            <div className="absolute inset-0">
              {/* Colored background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 opacity-80"></div>
              
              {/* Decorative patterns */}
              <div className="absolute inset-0 bg-[radial-gradient(#e0e7ff_1px,transparent_1px)] [background-size:20px_20px] opacity-30"></div>
              
              {/* Top highlight */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-300 to-transparent opacity-50"></div>
            </div>
        )}
      </div>

      {/* Header overlay with glassmorphism */}
      <div 
        className="absolute inset-0 w-full transition-all duration-300"
        style={getHeaderStyle()}
      />

      <nav 
        aria-label="Global" 
        className={`relative mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8 h-[10vh] transition-all duration-300`}
      >
        
        {/* Left Side*/}
        <div className="flex-1">
          <a href="#" className="relative flex items-center">
            <span className="sr-only">Maghreb Journey</span>
            <Link to="/" className="w-32 h-14 relative">
              <img
                alt="Company Logo"
                src="/src/assets/logo.png"
                className="absolute inset-0 w-full h-full object-contain"
              />
            </Link>
          </a>
        </div>

        {/* Open mobile menu */}
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon aria-hidden="true" className="size-6" />
          </button>
        </div>

        {/* Center navigation - fixed width container to prevent shifting */}
        <div className="hidden lg:flex lg:items-center lg:justify-center w-[400px]">
          <PopoverGroup className="flex gap-x-12 justify-center w-full">
            <Popover className="relative">
              <PopoverButton 
                className={`${getLinkClassName()} flex items-center gap-x-2`}
              >
                Product
                <ChevronDownIcon 
                  className={`size-4 ${
                    isHomePage ? 'text-gray-400' : 'text-gray-500'
                  }`} 
                />
              </PopoverButton>
              <PopoverPanel
                transition
                className="absolute -left-8 top-full z-10 mt-3 w-screen max-w-md overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-gray-900/5 transition data-[closed]:translate-y-1 data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-150 data-[enter]:ease-out data-[leave]:ease-in"
              >
                <div className="p-4">
                  {products.map((item) => (
                    <div
                      key={item.name}
                      className="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm/6 hover:bg-gray-50"
                    >
                      <div className="flex size-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                        <item.icon aria-hidden="true" className="size-6 text-gray-600 group-hover:text-indigo-600" />
                      </div>
                      <div className="flex-auto">
                        <a href={item.href} className="block font-semibold text-gray-900">
                          {item.name}
                          <span className="absolute inset-0" />
                        </a>
                        <p className="mt-1 text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 divide-x divide-gray-900/5 bg-gray-50">
                  {callsToAction.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="flex items-center justify-center gap-x-2.5 p-3 text-sm/6 font-semibold text-gray-900 hover:bg-gray-100"
                    >
                      <item.icon aria-hidden="true" className="size-5 flex-none text-gray-400" />
                      {item.name}
                    </a>
                  ))}
                </div>
              </PopoverPanel>
            </Popover>
            <a href="#" className={getLinkClassName()}>
              Features
            </a>
            <a href="#" className={getLinkClassName()}>
              Marketplace
            </a>
            <a href="#" className={getLinkClassName()}>
              Company
            </a>
          </PopoverGroup>
        </div>

        {/* Right side */}
        <div className="flex items-center lg:flex lg:flex-1 lg:justify-end gap-x-4">
          {user ? (
            <button
              onClick={handleLogout}
              className={`text-sm/6 font-semibold ${isHomePage ? 'text-white' : 'text-gray-900'}`}
            >
              Log out <span aria-hidden="true">&rarr;</span>
            </button>
          ) : (
              <a href="/login" className="text-sm/6 font-semibold text-white">
                Log in <span aria-hidden="true">&rarr;</span>
              </a>
          )}
          {isHomePage && 
            (<Button 
                asChild 
                className="bg-sahara-red text-white hover:bg-sahara-red/90"
                onClick={(e) => {
                  if (!user) {
                    e.preventDefault();
                    navigate('/login');
                  }
                }}
              >
                <Link to={user ? "/create-trip" : "#"}>Create your Trip</Link>
          </Button>)}
        </div>
      </nav>

      {/* Mobile menu */}
      <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
        <div className="fixed inset-0 z-10" />
        <DialogPanel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <a href="#" className="-m-1.5 p-1.5">
              <span className="sr-only">Your Company</span>
              <img
                alt=""
                src="https://tailwindui.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                className="h-8 w-auto"
              />
            </a>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon aria-hidden="true" className="size-6" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                <Disclosure as="div" className="-mx-3">
                  <DisclosureButton className="group flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50">
                    Product
                    <ChevronDownIcon aria-hidden="true" className="size-5 flex-none group-data-[open]:rotate-180" />
                  </DisclosureButton>
                  <DisclosurePanel className="mt-2 space-y-2">
                    {[...products, ...callsToAction].map((item) => (
                      <DisclosureButton
                        key={item.name}
                        as="a"
                        href={item.href}
                        className="block rounded-lg py-2 pl-6 pr-3 text-sm/7 font-semibold text-gray-900 hover:bg-gray-50"
                      >
                        {item.name}
                      </DisclosureButton>
                    ))}
                  </DisclosurePanel>
                </Disclosure>
                <a
                  href="#"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                >
                  Features
                </a>
                <a
                  href="#"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                >
                  Marketplace
                </a>
                <a
                  href="#"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                >
                  Company
                </a>
              </div>
              <div className="py-6">
                <a
                  href="#"
                  className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                >
                  Log in
                </a>
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  )}
  </>
    
  )
}