<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Etablissement;
use App\Models\Parametre;

class EtablissementSeeder extends Seeder
{
    public function run(): void
    {
        // Sample Establishments for major cities
        $establishments = [
            'CASA' => [
                'CASABLANCA' => [
                    ['code' => 'ISTA_MAARIF', 'nom' => 'ISTA Maârif'],
                    ['code' => 'ISTA_HAY_HASSANI', 'nom' => 'ISTA Hay Hassani'],
                    ['code' => 'ISTA_SIDI_MOUMEN', 'nom' => 'ISTA Sidi Moumen'],
                ],
                'MOHAMMEDIA' => [
                    ['code' => 'ISTA_MOHAMMEDIA', 'nom' => 'ISTA Mohammedia'],
                ],
            ],
            'RABAT' => [
                'RABAT' => [
                    ['code' => 'ISTA_RABAT_AGDAL', 'nom' => 'ISTA Rabat Agdal'],
                ],
                'SALE' => [
                    ['code' => 'ISTA_SALE_TABRIQUET', 'nom' => 'ISTA Salé Tabriquet'],
                ],
                'KENITRA' => [
                    ['code' => 'ISTA_KENITRA_MAAMORA', 'nom' => 'ISTA Kénitra Maâmora'],
                ],
            ],
            'MARRAKECH' => [
                'MARRAKECH' => [
                    ['code' => 'ISTA_MARRAKECH_GUELIZ', 'nom' => 'ISTA Marrakech Guéliz'],
                ],
            ],
            'FES-MEKNES' => [
                'FES' => [
                    ['code' => 'ISTA_FES_ADARIS', 'nom' => 'ISTA Fès Adarissa'],
                ],
            ],
        ];

        foreach ($establishments as $regionCode => $cities) {
            $region = Parametre::where('type', 'REGION')->where('code', $regionCode)->first();
            if (!$region) continue;

            foreach ($cities as $cityCode => $etabs) {
                $city = Parametre::where('type', 'VILLE')->where('code', $cityCode)->first();
                if (!$city) continue;

                foreach ($etabs as $etabData) {
                    Etablissement::updateOrCreate(
                        ['code' => $etabData['code']],
                        [
                            'nom' => $etabData['nom'],
                            'ville_id' => $city->id,
                            'region_id' => $region->id,
                            'actif' => true,
                        ]
                    );
                }
            }
        }
    }
}
