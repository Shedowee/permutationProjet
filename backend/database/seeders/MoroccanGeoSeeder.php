<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Parametre;

class MoroccanGeoSeeder extends Seeder
{
    public function run(): void
    {
        $regions = [
            'TTAH' => [
                'libelle' => 'Tanger-Tétouan-Al Hoceïma', 
                'cities' => ['Tanger', 'Tétouan', 'Al Hoceïma', 'Larache', 'Ksar El Kébir', 'Ouezzane', 'Chefchaouen', 'Fnideq', 'M\'diq', 'Martil', 'Asilah']
            ],
            'ORIENTAL' => [
                'libelle' => "L'Oriental", 
                'cities' => ['Oujda', 'Nador', 'Berkane', 'Taourirt', 'Jerada', 'Figuig', 'Guercif', 'Driouch', 'Zaio', 'Ahfir', 'Oulad Teima']
            ],
            'FES-MEKNES' => [
                'libelle' => 'Fès-Meknès', 
                'cities' => ['Fès', 'Meknès', 'Taza', 'Sefrou', 'Ifrane', 'Moulay Yaâcoub', 'El Hajeb', 'Boulemane', 'Missour', 'Azrou', 'Aknoul']
            ],
            'RABAT' => [
                'libelle' => 'Rabat-Salé-Kénitra', 
                'cities' => ['Rabat', 'Salé', 'Kénitra', 'Témara', 'Skhirat', 'Khémisset', 'Sidi Kacem', 'Sidi Slimane', 'Souk El Arbaâ', 'Sidi Yahya El Gharb']
            ],
            'BENI-MELLAL' => [
                'libelle' => 'Béni Mellal-Khénifra', 
                'cities' => ['Béni Mellal', 'Khénifra', 'Azilal', 'Fquih Ben Salah', 'Khouribga', 'Kasba Tadla', 'Ouaouizeght', 'Bejaâd', 'Oued Zem']
            ],
            'CASA' => [
                'libelle' => 'Casablanca-Settat', 
                'cities' => ['Casablanca', 'Mohammedia', 'El Jadida', 'Settat', 'Berrechid', 'Benslimane', 'Sidi Bennour', 'Azemmour', 'Had Soualem', 'Oulad Abbou']
            ],
            'MARRAKECH' => [
                'libelle' => 'Marrakech-Safi', 
                'cities' => ['Marrakech', 'Safi', 'Essaouira', 'El Kelaâ des Sraghna', 'Youssoufia', 'Benguérir', 'Chichaoua', 'Tahannaout', 'Imintanout']
            ],
            'DRAA' => [
                'libelle' => 'Drâa-Tafilalet', 
                'cities' => ['Errachidia', 'Ouarzazate', 'Midelt', 'Tinghir', 'Zagora', 'Erfoud', 'Rissani', 'Boudnib', 'Goulmima']
            ],
            'SOUSS' => [
                'libelle' => 'Souss-Massa', 
                'cities' => ['Agadir', 'Inezgane', 'Dcheira El Jihadia', 'Aït Melloul', 'Biougra', 'Taroudant', 'Tiznit', 'Tata', 'Tafraout', 'Massa']
            ],
            'GUELMIM' => [
                'libelle' => 'Guelmim-Oued Noun', 
                'cities' => ['Guelmim', 'Tan-Tan', 'Sidi Ifni', 'Assa', 'Zag', 'Bouizakarne', 'Mirleft']
            ],
            'LAAYOUNE' => [
                'libelle' => 'Laâyoune-Sakia El Hamra', 
                'cities' => ['Laâyoune', 'Smara', 'Boujdour', 'Tarfaya', 'El Marsa']
            ],
            'DAKHLA' => [
                'libelle' => 'Dakhla-Oued Ed-Dahab', 
                'cities' => ['Dakhla', 'Aousserd', 'Lagouira']
            ],
        ];

        foreach ($regions as $code => $data) {
            $region = Parametre::updateOrCreate(
                ['type' => 'REGION', 'code' => $code],
                ['libelle' => $data['libelle'], 'ordre' => 1, 'actif' => true]
            );

            $ordre = 1;
            foreach ($data['cities'] as $city) {
                // Generate a clean code for the city
                $cityCode = strtoupper(str_replace(
                    [' ', 'â', 'ï', 'ô', 'é', 'è', 'ê', 'à', 'ç', '\''], 
                    ['_', 'A', 'I', 'O', 'E', 'E', 'E', 'A', 'C', ''], 
                    $city
                ));
                
                Parametre::updateOrCreate(
                    ['type' => 'VILLE', 'code' => $cityCode],
                    [
                        'libelle' => $city, 
                        'ordre' => $ordre++, 
                        'actif' => true, 
                        'parent_id' => $region->id
                    ]
                );
            }
        }
    }
}
