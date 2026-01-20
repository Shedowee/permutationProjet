<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Parametre;

class MoroccanGeoSeeder extends Seeder
{
    public function run(): void
    {
        $regions = [
            'TTAH' => ['libelle' => 'Tanger-Tétouan-Al Hoceima', 'cities' => ['Tanger','Tétouan','Al Hoceïma','Chefchaouen','Larache','Ksar El Kebir','Ouezzane']],
            'ORIENTAL' => ['libelle' => "L'Oriental", 'cities' => ['Oujda','Nador','Berkane','Taourirt','Jerada','Driouch','Guercif']],
            'FES-MEKNES' => ['libelle' => 'Fès-Meknès', 'cities' => ['Fès','Meknès','Ifrane','Sefrou','El Hajeb','Taza','Boulemane']],
            'RABAT' => ['libelle' => 'Rabat-Salé-Kénitra', 'cities' => ['Rabat','Salé','Kénitra','Skhirat','Temara','Sidi Kacem','Sidi Slimane']],
            'BENI-MELLAL' => ['libelle' => 'Béni Mellal-Khénifra', 'cities' => ['Béni Mellal','Khénifra','Azilal','Kasbat Tadla','Fquih Ben Salah','Midelt']],
            'CASA' => ['libelle' => 'Casablanca-Settat', 'cities' => ['Casablanca','Mohammedia','Settat','El Jadida','Berrechid','Benslimane','Sidi Bennour']],
            'MARRAKECH' => ['libelle' => 'Marrakech-Safi', 'cities' => ['Marrakech','Safi','Essaouira','Chichaoua','Youssoufia','El Kelaâ des Sraghna']],
            'DRAA' => ['libelle' => 'Drâa-Tafilalet', 'cities' => ['Errachidia','Ouarzazate','Zagora','Tinghir','Midelt']],
            'SOUSS' => ['libelle' => 'Souss-Massa', 'cities' => ['Agadir','Inezgane','Taroudant','Tiznit','Chtouka Aït Baha']],
            'GUELMIM' => ['libelle' => 'Guelmim-Oued Noun', 'cities' => ['Guelmim','Tan-Tan','Assa-Zag','Sidi Ifni']],
            'LAAYOUNE' => ['libelle' => 'Laâyoune-Sakia El Hamra', 'cities' => ['Laâyoune','Boujdour','Tarfaya','Smara']],
            'DAKHLA' => ['libelle' => 'Dakhla-Oued Ed-Dahab', 'cities' => ['Dakhla','Aousserd']],
        ];

        foreach ($regions as $code => $data) {
            $region = Parametre::firstOrCreate(
                ['type' => 'REGION', 'code' => $code],
                ['libelle' => $data['libelle'], 'ordre' => 1, 'actif' => true]
            );

            $ordre = 1;
            foreach ($data['cities'] as $city) {
                Parametre::firstOrCreate(
                    ['type' => 'VILLE', 'code' => strtoupper(str_replace([' ', 'â', 'ï', 'ô', 'é', 'è', 'ê'], ['_', 'A', 'I', 'O', 'E', 'E', 'E'], $city))],
                    ['libelle' => $city, 'ordre' => $ordre++, 'actif' => true, 'parent_id' => $region->id]
                );
            }
        }
    }
}
