// Definição da interface para filmes no catálogo
export interface CatalogMovie {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  posterUrl: string;
  streamUrl: string;
  year: number;
  duration: number;
  genre: string;
}

// Catálogo inicial de filmes
export const catalogMovies: CatalogMovie[] = [
  {
    id: '1',
    title: 'Ilha do Medo (2010)',
    description: 'Dois agentes federais investigam o desaparecimento de uma paciente de um hospital psiquiátrico localizado em uma ilha remota.',
    videoUrl: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4',
    posterUrl: 'https://peach.blender.org/wp-content/uploads/bbb-splash.png',
    streamUrl: 'https://sempra.pro/a1/out/old/6/1167/1167_74158594ilha-do-medo-2010.m3u8',
    year: 2010,
    duration: 138,
    genre: 'Thriller'
  },
  {
    id: '2',
    title: 'Interestelar (2014)',
    description: 'Uma equipe de exploradores viaja através de um buraco de minhoca no espaço na tentativa de garantir a sobrevivência da humanidade.',
    videoUrl: 'https://test-videos.co.uk/vids/elephantsdream/mp4/h264/1080/Elephants_Dream_1080_10s_1MB.mp4',
    posterUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Elephants_Dream_poster.jpg/1200px-Elephants_Dream_poster.jpg',
    streamUrl: 'https://video.wixstatic.com/video/85a3b3_0a4c4dc2d11b41b881f8ded501255716/720p/mp4/file.mp4',
    year: 2014,
    duration: 169,
    genre: 'Ficção Científica'
  },
  {
    id: '3',
    title: 'O Poderoso Chefão (1972)',
    description: 'A saga da família Corleone, liderada por Don Vito Corleone, e a ascensão ao poder de seu filho Michael.',
    videoUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    posterUrl: 'https://image.mux.com/x36xhzz/thumbnail.jpg',
    streamUrl: 'https://play.prod.gcp.vix.services/godfather_pt1_pt/godfather_pt1_pt_1-1/play_v1_hls_1080p.m3u8',
    year: 1972,
    duration: 175,
    genre: 'Crime'
  },
  {
    id: '4',
    title: 'Clube da Luta (1999)',
    description: 'Um homem insone e um fabricante de sabão misterioso formam um clube de luta subterrâneo que evolui para muito mais.',
    videoUrl: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4',
    posterUrl: 'https://peach.blender.org/wp-content/uploads/bbb-splash.png',
    streamUrl: 'https://play.prod.gcp.vix.services/fight-club_pt/fight-club_pt_1-1/play_v1_hls_1080p.m3u8',
    year: 1999,
    duration: 139,
    genre: 'Drama'
  },
  {
    id: '5',
    title: 'Pulp Fiction (1994)',
    description: 'As vidas de dois assassinos da máfia, um boxeador, uma esposa de gangster e um par de assaltantes de restaurantes se entrelaçam em quatro histórias de violência e redenção.',
    videoUrl: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4',
    posterUrl: 'https://peach.blender.org/wp-content/uploads/bbb-splash.png',
    streamUrl: 'https://play.prod.gcp.vix.services/pulp-fiction_pt/pulp-fiction_pt_1-1/play_v1_hls_1080p.m3u8',
    year: 1994,
    duration: 154,
    genre: 'Crime'
  },
  {
    id: '6',
    title: 'A Origem (2010)',
    description: 'Um ladrão especializado em extrair segredos do subconsciente das pessoas durante o estado de sonho é oferecido a chance de ter sua vida normal de volta se conseguir realizar a tarefa impossível de plantar uma ideia na mente de alguém.',
    videoUrl: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4',
    posterUrl: 'https://peach.blender.org/wp-content/uploads/bbb-splash.png',
    streamUrl: 'https://play.prod.gcp.vix.services/inception_pt/inception_pt_1-1/play_v1_hls_1080p.m3u8',
    year: 2010,
    duration: 148,
    genre: 'Ação'
  },
  {
    id: '7',
    title: 'Cidade de Deus (2002)',
    description: 'A história da formação do crime organizado em uma favela do Rio de Janeiro, desde os anos 1960 até o início dos anos 1980, através dos olhos de um jovem chamado Buscapé.',
    videoUrl: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4',
    posterUrl: 'https://peach.blender.org/wp-content/uploads/bbb-splash.png',
    streamUrl: 'https://play.prod.gcp.vix.services/city-of-god_pt/city-of-god_pt_1-1/play_v1_hls_1080p.m3u8',
    year: 2002,
    duration: 130,
    genre: 'Crime'
  },
  {
    id: '8',
    title: 'O Iluminado (1980)',
    description: 'Um escritor e ex-professor torna-se zelador de inverno em um hotel isolado nas montanhas do Colorado, onde fica obcecado com forças sobrenaturais.',
    videoUrl: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4',
    posterUrl: 'https://peach.blender.org/wp-content/uploads/bbb-splash.png',
    streamUrl: 'https://play.prod.gcp.vix.services/shining_pt/shining_pt_1-1/play_v1_hls_1080p.m3u8',
    year: 1980,
    duration: 146,
    genre: 'Terror'
  }
];

// Função para buscar um filme por ID
export function getMovieById(id: string): CatalogMovie | undefined {
  return catalogMovies.find(movie => movie.id === id);
}

// Função para buscar todos os filmes do catálogo
export function getAllMovies(): CatalogMovie[] {
  return catalogMovies;
}

// Função para buscar filmes por gênero
export function getMoviesByGenre(genre: string): CatalogMovie[] {
  return catalogMovies.filter(movie => movie.genre === genre);
}