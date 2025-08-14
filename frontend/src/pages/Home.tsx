import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useQuery } from '@tanstack/react-query';
import { moviesApi } from '../services/api';
import { Container, Card, Button, Text, Grid, colors, LoadingWrapper, Spinner } from '../styles/GlobalStyles';

const HeroSection = styled.section`
  background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%);
  padding: 80px 0;
  color: ${colors.white};
  text-align: center;
`;

const HeroContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const HeroTitle = styled.h1`
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;
`;

const Section = styled.section`
  padding: 60px 0;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 2rem;
  text-align: center;
  color: ${colors.gray[800]};
`;

const MovieCard = styled(Card)`
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
`;

const MoviePoster = styled.img`
  width: 100%;
  height: 300px;
  object-fit: cover;
  border-radius: 8px 8px 0 0;
`;

const MovieInfo = styled.div`
  padding: 16px;
`;

const MovieTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: ${colors.gray[800]};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const MovieDetails = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
`;

const Rating = styled.span`
  background: ${colors.success};
  color: ${colors.white};
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
`;

const GenreBadge = styled.span`
  background: ${colors.gray[100]};
  color: ${colors.gray[600]};
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  margin-right: 8px;
`;

const Home: React.FC = () => {
  const navigate = useNavigate();

  const { data: moviesData, isLoading } = useQuery({
    queryKey: ['movies', 'home'],
    queryFn: () => moviesApi.getMovies({ limit: 8 }),
  });

  const movies = moviesData?.data.data || [];

  const handleMovieClick = (movieId: string) => {
    navigate(`/movie/${movieId}`);
  };

  return (
    <>
      <HeroSection>
        <Container>
          <HeroContent>
            <HeroTitle>Book Your Movie Tickets</HeroTitle>
            <HeroSubtitle>
              Discover the latest movies, events, and entertainment near you
            </HeroSubtitle>
            <Button
              size="large"
              variant="secondary"
              onClick={() => navigate('/movies')}
            >
              Explore Movies
            </Button>
          </HeroContent>
        </Container>
      </HeroSection>

      <Section>
        <Container>
          <SectionTitle>Now Showing</SectionTitle>
          
          {isLoading ? (
            <LoadingWrapper>
              <Spinner />
            </LoadingWrapper>
          ) : (
            <Grid cols={4} minWidth="250px">
              {movies.map((movie) => (
                <MovieCard
                  key={movie._id}
                  onClick={() => handleMovieClick(movie._id)}
                >
                  <MoviePoster
                    src={movie.poster}
                    alt={movie.title}
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/300x450?text=Movie+Poster';
                    }}
                  />
                  <MovieInfo>
                    <MovieTitle>{movie.title}</MovieTitle>
                    <div>
                      {movie.genre.slice(0, 2).map((genre) => (
                        <GenreBadge key={genre}>{genre}</GenreBadge>
                      ))}
                    </div>
                    <Text size="sm" color={colors.gray[600]}>
                      {/* ✅ FIX: Changed movie.language to movie.languages */}
                      {movie.languages.join(', ')} • {movie.duration} mins
                    </Text>
                    <MovieDetails>
                      <Rating>★ {movie.imdbRating}/10</Rating>
                      <Button size="small" variant="outline">
                        Book Now
                      </Button>
                    </MovieDetails>
                  </MovieInfo>
                </MovieCard>
              ))}
            </Grid>
          )}
        </Container>
      </Section>
    </>
  );
};

export default Home;