<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Parametre;
use App\Models\Etablissement;

class ParametreSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Etats des demandes
        $etats = [
            ['key' => 'EN_ATTENTE', 'libelle' => 'En attente'],
            ['key' => 'EN_COURS', 'libelle' => 'En cours de traitement'],
            ['key' => 'VALIDE', 'libelle' => 'Validée'],
            ['key' => 'REFUSE', 'libelle' => 'Refusée'],
            ['key' => 'ANNULE', 'libelle' => 'Annulée'],
        ];

        foreach ($etats as $index => $etat) {
            Parametre::updateOrCreate(
                ['type' => 'ETAT', 'key' => $etat['key']],
                ['value' => ['libelle' => $etat['libelle']], 'ordre' => $index + 1]
            );
        }

        // 2. Grades OFPPT
        $grades = [
            ['key' => 'FORMATEUR', 'libelle' => 'Formateur'],
            ['key' => 'FORMATEUR_ANIMATEUR', 'libelle' => 'Formateur Animateur'],
            ['key' => 'CHEF_TRAVAUX', 'libelle' => 'Chef de Travaux'],
            ['key' => 'DIRECTEUR_ETAB', 'libelle' => 'Directeur d\'Etablissement'],
            ['key' => 'ADMINISTRATIF', 'libelle' => 'Personnel Administratif'],
        ];

        foreach ($grades as $index => $grade) {
            Parametre::updateOrCreate(
                ['type' => 'GRADE', 'key' => $grade['key']],
                ['value' => ['libelle' => $grade['libelle']], 'ordre' => $index + 1]
            );
        }

        // 3. Régions et Villes du Maroc
        $regions = [
            'TANGER_TETOUAN_AL_HOCEIMA' => [
                'libelle' => 'Tanger-Tétouan-Al Hoceïma',
                'villes' => [
                    'TANGER' => 'Tanger',
                    'TETOUAN' => 'Tétouan',
                    'AL_HOCEIMA' => 'Al Hoceïma',
                    'LARACHE' => 'Larache',
                    'KSAR_KEBIR' => 'Ksar El Kébir',
                ]
            ],
            'ORIENTAL' => [
                'libelle' => 'L\'Oriental',
                'villes' => [
                    'OUJDA' => 'Oujda',
                    'NADOR' => 'Nador',
                    'BERKANE' => 'Berkane',
                    'TAOURIRT' => 'Taourirt',
                ]
            ],
            'FES_MEKNES' => [
                'libelle' => 'Fès-Meknès',
                'villes' => [
                    'FES' => 'Fès',
                    'MEKNES' => 'Meknès',
                    'TAZA' => 'Taza',
                    'IFRANE' => 'Ifrane',
                ]
            ],
            'RABAT_SALE_KENITRA' => [
                'libelle' => 'Rabat-Salé-Kénitra',
                'villes' => [
                    'RABAT' => 'Rabat',
                    'SALE' => 'Salé',
                    'KENITRA' => 'Kénitra',
                    'SKHIRAT' => 'Skhirat',
                    'TEMARA' => 'Témara',
                ]
            ],
            'BENI_MELLAL_KHENIFRA' => [
                'libelle' => 'Béni Mellal-Khénifra',
                'villes' => [
                    'BENI_MELLAL' => 'Béni Mellal',
                    'KHOURIBGA' => 'Khouribga',
                    'KHENIFRA' => 'Khénifra',
                ]
            ],
            'CASABLANCA_SETTAT' => [
                'libelle' => 'Casablanca-Settat',
                'villes' => [
                    'CASABLANCA' => 'Casablanca',
                    'MOHAMMEDIA' => 'Mohammédia',
                    'EL_JADIDA' => 'El Jadida',
                    'SETTAT' => 'Settat',
                    'BERRECHID' => 'Berrechid',
                ]
            ],
            'MARRAKECH_SAFI' => [
                'libelle' => 'Marrakech-Safi',
                'villes' => [
                    'MARRAKECH' => 'Marrakech',
                    'SAFI' => 'Safi',
                    'ESSAOUIRA' => 'Essaouira',
                    'EL_KELA_DES_SRAGHNA' => 'El Kelâa des Sraghna',
                ]
            ],
            'DRAA_TAFILALET' => [
                'libelle' => 'Drâa-Tafilalet',
                'villes' => [
                    'ERRACHIDIA' => 'Errachidia',
                    'OUARZAZATE' => 'Ouarzazate',
                    'MIDELT' => 'Midelt',
                ]
            ],
            'SOUSS_MASSA' => [
                'libelle' => 'Souss-Massa',
                'villes' => [
                    'AGADIR' => 'Agadir',
                    'INEZGANE' => 'Inezgane',
                    'TIZNIT' => 'Tiznit',
                    'TAROUDANT' => 'Taroudant',
                ]
            ],
            'GUELMIM_OUED_NOUN' => [
                'libelle' => 'Guelmim-Oued Noun',
                'villes' => [
                    'GUELMIM' => 'Guelmim',
                    'TAN_TAN' => 'Tan-Tan',
                ]
            ],
            'LAAYOUNE_SAKIA_EL_HAMRA' => [
                'libelle' => 'Laâyoune-Sakia El Hamra',
                'villes' => [
                    'LAAYOUNE' => 'Laâyoune',
                    'BOUJDOUR' => 'Boujdour',
                ]
            ],
            'DAKHLA_OUED_ED_DAHAB' => [
                'libelle' => 'Dakhla-Oued Ed-Dahab',
                'villes' => [
                    'DAKHLA' => 'Dakhla',
                ]
            ],
        ];

        $indexRegion = 1;
        foreach ($regions as $regionKey => $regionData) {
            $region = Parametre::updateOrCreate(
                ['type' => 'REGION', 'key' => $regionKey],
                ['value' => ['libelle' => $regionData['libelle']], 'ordre' => $indexRegion++]
            );

            $indexVille = 1;
            foreach ($regionData['villes'] as $villeKey => $villeLibelle) {
                Parametre::updateOrCreate(
                    ['type' => 'VILLE', 'key' => $villeKey],
                    [
                        'value' => ['libelle' => $villeLibelle], 
                        'parent_id' => $region->id, 
                        'ordre' => $indexVille++
                    ]
                );
            }
        }

        // 4. Etablissements OFPPT (Echantillon représentatif)
        $etablissements = [
            // Casablanca
            ['name' => 'ISTA MAARIF', 'city_key' => 'CASABLANCA'],
            ['name' => 'ISTA NTIC SIDI MAAROUF', 'city_key' => 'CASABLANCA'],
            ['name' => 'ISGI CASABLANCA', 'city_key' => 'CASABLANCA'],
            ['name' => 'ISTA HAY HASSANI', 'city_key' => 'CASABLANCA'],
            ['name' => 'ISTA ROUTE DE RABAT', 'city_key' => 'CASABLANCA'],
            
            // Rabat-Salé
            ['name' => 'ISTA SALE TABRIQUET', 'city_key' => 'SALE'],
            ['name' => 'ISTA HAY RIAD', 'city_key' => 'RABAT'],
            ['name' => 'ISTA TAKADOUM', 'city_key' => 'RABAT'],
            ['name' => 'ISTA KENITRA MAAMORA', 'city_key' => 'KENITRA'],
            
            // Tanger
            ['name' => 'ISTA TANGER 1', 'city_key' => 'TANGER'],
            ['name' => 'ISTA NTIC TANGER', 'city_key' => 'TANGER'],
            
            // Marrakech
            ['name' => 'ISTA MARRAKECH GUELIZ', 'city_key' => 'MARRAKECH'],
            ['name' => 'ISTA SYBA MARRAKECH', 'city_key' => 'MARRAKECH'],
            
            // Agadir
            ['name' => 'ISTA AGADIR TILLILA', 'city_key' => 'AGADIR'],
            ['name' => 'ISTA INEZGANE', 'city_key' => 'INEZGANE'],
            
            // Fes/Meknes
            ['name' => 'ISTA FES ROUTE D\'IMOUZZER', 'city_key' => 'FES'],
            ['name' => 'ISTA MEKNES AGDAL', 'city_key' => 'MEKNES'],
            
            // Oujda
            ['name' => 'ISTA OUJDA LAZARET', 'city_key' => 'OUJDA'],
            
            // Sud
            ['name' => 'ISTA LAAYOUNE', 'city_key' => 'LAAYOUNE'],
            ['name' => 'ISTA DAKHLA', 'city_key' => 'DAKHLA'],
        ];

        foreach ($etablissements as $etab) {
            $city = Parametre::where('type', 'VILLE')->where('key', $etab['city_key'])->first();
            
            if ($city) {
                Etablissement::updateOrCreate(
                    ['name' => $etab['name']],
                    [
                        'city_id' => $city->id,
                        'address' => $city->value['libelle'] . ', Maroc',
                        'contact_phone' => '05' . rand(2, 4) . rand(1000000, 9999999),
                        'contact_email' => strtolower(str_replace(' ', '.', $etab['name'])) . '@ofppt.ma',
                        'metadata' => ['city_key' => $etab['city_key']]
                    ]
                );
            }
        }
    }
}
