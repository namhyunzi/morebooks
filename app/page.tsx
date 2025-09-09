import Header from "@/components/header"
import Footer from "@/components/footer"
import MainBanner from "@/components/main-banner"
import BookRecommendations from "@/components/book-recommendations"
import ServiceIcons from "@/components/service-icons"
import TodaysSelection from "@/components/todays-selection"
import PublisherRecommendations from "@/components/publisher-recommendations"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <MainBanner />
        <div className="container mx-auto px-4 py-8 space-y-12 max-w-6xl">
          <ServiceIcons />
          <TodaysSelection />
          <BookRecommendations />
          <PublisherRecommendations />
        </div>
      </main>
      <Footer />
    </div>
  )
}
