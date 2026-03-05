import { Star, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"

interface Review {
  name: string
  location: string
  rating: number
  date: string
  text: string
}

interface GoogleReview {
  author_name: string
  rating: number
  relative_time_description: string
  text: string
  profile_photo_url: string
}

const PLACE_ID =
  process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID || process.env.GOOGLE_PLACE_ID

const reviewUrl = PLACE_ID
  ? `https://search.google.com/local/writereview?placeid=${PLACE_ID}`
  : "#"

async function getGoogleReviews(): Promise<Review[]> {
  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || process.env.GOOGLE_API_KEY
  const PLACE_ID = process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID || process.env.GOOGLE_PLACE_ID

  if (!API_KEY || !PLACE_ID) {
    return []
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=reviews&key=${API_KEY}`,
      { next: { revalidate: 86400 } }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch reviews: ${response.statusText}`)
    }

    const data = await response.json()

    if (data.status !== "OK" || !data.result || !data.result.reviews) {
      return []
    }

    return data.result.reviews
      .filter((review: GoogleReview) => review.rating >= 4)
      .map((review: GoogleReview) => ({
        name: review.author_name,
        location: "Google Review",
        rating: review.rating,
        date: review.relative_time_description,
        text: review.text,
      }))
  } catch (error) {
    return []
  }
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex justify-center gap-0.5 mt-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3 w-3 ${star <= rating
            ? "fill-primary text-primary"
            : "text-border"
            }`}
        />
      ))}
    </div>
  )
}

export async function ReviewsSection({ dict }: { dict: any }) {
  const reviews = await getGoogleReviews()

  // If no reviews, mock data for the layout demonstration
  const displayReviews = reviews.length > 0 ? reviews : [
    { name: "Carlos Garcia", location: "Madrid, Spain 🇪🇸", rating: 5, date: "1 month ago", text: "My stay at Sato Cave Hotel and Resort was absolutely fantastic! The luxurious ambiance and elegant decor made it feel like a true five-star experience. Highly recommended for anyone seeking a top-notch luxury stay!" },
    { name: "Emma Wilson", location: "Canberra, Australia 🇦🇺", rating: 5, date: "2 months ago", text: "The atmosphere was serene and beautifully decorated, making it ideal for couples. The spa services were excellent, offering a variety of treatments that left us feeling rejuvenated." },
    { name: "Yui Suzuki", location: "Osaka, Japan 🇯🇵", rating: 5, date: "3 months ago", text: "We had a wonderful family vacation at Sato Hotel and Resort. The resort had something for everyone, including a kids' club, multiple pools, and a variety of activities." },
    { name: "Klara Braun", location: "Wolfsburg, Germany 🇩🇪", rating: 5, date: "4 months ago", text: "The conference facilities were top-notch, and the staff were incredibly courteous. My room was spacious and comfortable, providing a great place to unwind after meetings." },
    { name: "Lukas Wagner", location: "Vienna, Austria 🇦🇹", rating: 5, date: "5 months ago", text: "Considering the prices for some dining options to be quite high, the quality is excellent. It's worth considering if you're on a budget. Staff were professional and the location is perfect." }
  ]



  return (
    <section id="reviews" className="bg-background py-24 px-6 lg:px-8 overflow-hidden">
      <div className="mx-auto max-w-7xl">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <h2 className="font-sans text-4xl sm:text-5xl font-medium tracking-tight text-foreground md:text-5xl lg:text-6xl mb-6">
            {dict?.title || "The Words of Our Guest!"}
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            {dict?.description || "From luxurious rooms and top-notch amenities to friendly staff and delicious dining, our guests share their honest feedback."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 px-4 sm:px-6">
          {displayReviews.map((review, i) => (
            <div
              key={i}
              className={`bg-card rounded-2xl p-6 shadow-sm border border-border/40 transition-all duration-300 hover:shadow-md flex flex-col`}
            >

              <div className="flex-grow">
                <p className="text-sm leading-relaxed text-muted-foreground text-center line-clamp-6">
                  {review.text}
                </p>
              </div>

              <div className="mt-6 flex flex-col items-center justify-center gap-3">
                <div className="h-10 w-10 overflow-hidden rounded-full bg-border flex items-center justify-center text-xs font-semibold">
                  {review.name.charAt(0)}
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-foreground">
                    {review.name}
                  </p>
                  <StarRating rating={review.rating} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex items-center justify-center">
          <a
            href={reviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full bg-foreground px-8 py-3 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
          >
            Leave a Review
          </a>
        </div>
      </div>
    </section>
  )
}
