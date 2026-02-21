import React from 'react'

export const HeroSkeleton: React.FC = () => {
    return (
        <div className="relative h-[600px] lg:h-[700px] w-full overflow-hidden bg-zinc-900 animate-pulse">
            {/* Background Placeholder */}
            <div className="absolute inset-0 bg-zinc-800" />

            {/* Content Placeholder */}
            <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
                <div className="max-w-2xl">
                    {/* Badge */}
                    <div className="h-8 w-32 bg-zinc-700 rounded-full mb-6" />

                    {/* Title */}
                    <div className="h-16 w-3/4 bg-zinc-700 rounded-lg mb-4" />
                    <div className="h-16 w-1/2 bg-zinc-700 rounded-lg mb-6" />

                    {/* Description */}
                    <div className="h-4 w-full bg-zinc-700 rounded mb-2" />
                    <div className="h-4 w-5/6 bg-zinc-700 rounded mb-8" />

                    {/* Features used to be here */}
                    <div className="flex gap-4 mb-10">
                        <div className="h-12 w-12 bg-zinc-700 rounded-lg" />
                        <div className="h-12 w-32 bg-zinc-700 rounded-lg" />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-4">
                        <div className="h-14 w-48 bg-zinc-700 rounded-lg" />
                        <div className="h-14 w-40 bg-zinc-700 rounded-lg" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HeroSkeleton



