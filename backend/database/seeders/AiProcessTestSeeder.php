<?php

namespace Database\Seeders;

use App\Models\DemandePermutation;
use App\Models\Etablissement;
use App\Models\Formateur;
use App\Models\Parametre;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AiProcessTestSeeder extends Seeder
{
    public function run(): void
    {
        $formateurRole = Role::where('code', 'formateur')->first();
        $pending = Parametre::where('type', 'ETAT')->where('key', 'EN_ATTENTE')->first();

        if (!$formateurRole || !$pending) {
            return;
        }

        $cases = [
            // Direct reciprocal match: Casablanca <-> Sale.
            [
                'name' => 'AI Direct Casa',
                'email' => 'ai.direct.casa@ofppt.test',
                'employee_number' => 'AI-DIR-001',
                'current' => 'ISTA MAARIF',
                'target' => 'ISTA SALE TABRIQUET',
                'motif' => 'AI test direct match from Casablanca to Sale.',
                'urgency' => 5,
            ],
            [
                'name' => 'AI Direct Sale',
                'email' => 'ai.direct.sale@ofppt.test',
                'employee_number' => 'AI-DIR-002',
                'current' => 'ISTA SALE TABRIQUET',
                'target' => 'ISTA MAARIF',
                'motif' => 'AI test direct match from Sale to Casablanca.',
                'urgency' => 5,
            ],

            // Regional fallback: target region has a compatible candidate, but not the exact target city.
            [
                'name' => 'AI Regional Casa',
                'email' => 'ai.regional.casa@ofppt.test',
                'employee_number' => 'AI-REG-001',
                'current' => 'ISTA HAY HASSANI',
                'target' => 'ISTA HAY RIAD',
                'motif' => 'AI test regional opportunity from Casablanca toward Rabat.',
                'urgency' => 4,
            ],
            [
                'name' => 'AI Regional Sale',
                'email' => 'ai.regional.sale@ofppt.test',
                'employee_number' => 'AI-REG-002',
                'current' => 'ISTA SALE TABRIQUET',
                'target' => 'ISTA NTIC SIDI MAAROUF',
                'motif' => 'AI test regional candidate from Sale toward Casablanca region.',
                'urgency' => 4,
            ],

            // Multihop cycle: Casablanca -> Sale -> Tanger -> Casablanca.
            [
                'name' => 'AI Cycle Casa',
                'email' => 'ai.cycle.casa@ofppt.test',
                'employee_number' => 'AI-CYC-001',
                'current' => 'ISGI CASABLANCA',
                'target' => 'ISTA SALE TABRIQUET',
                'motif' => 'AI test multihop cycle leg Casablanca to Sale.',
                'urgency' => 3,
            ],
            [
                'name' => 'AI Cycle Sale',
                'email' => 'ai.cycle.sale@ofppt.test',
                'employee_number' => 'AI-CYC-002',
                'current' => 'ISTA SALE TABRIQUET',
                'target' => 'ISTA TANGER 1',
                'motif' => 'AI test multihop cycle leg Sale to Tanger.',
                'urgency' => 3,
            ],
            [
                'name' => 'AI Cycle Tanger',
                'email' => 'ai.cycle.tanger@ofppt.test',
                'employee_number' => 'AI-CYC-003',
                'current' => 'ISTA TANGER 1',
                'target' => 'ISGI CASABLANCA',
                'motif' => 'AI test multihop cycle leg Tanger to Casablanca.',
                'urgency' => 3,
            ],
        ];

        foreach ($cases as $index => $case) {
            $current = Etablissement::where('name', $case['current'])->first();
            $target = Etablissement::where('name', $case['target'])->first();

            if (!$current || !$target) {
                continue;
            }

            $user = User::updateOrCreate(
                ['email' => $case['email']],
                [
                    'uuid' => (string) Str::uuid(),
                    'name' => $case['name'],
                    'password_hash' => Hash::make('AiTest123!'),
                    'role_id' => $formateurRole->id,
                    'status' => 'active',
                    'email_verified_at' => now(),
                    'phone' => '0600099' . str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT),
                    'age' => 30 + $index,
                    'address' => $current->ville?->value['libelle'] ?? 'Maroc',
                ]
            );

            $formateur = Formateur::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'employee_number' => $case['employee_number'],
                    'position' => 'Formateur Permanent',
                    'specialite' => 'Developpement Digital',
                    'hire_date' => now()->subYears(6)->subMonths($index)->toDateString(),
                    'salary' => 8500 + ($index * 100),
                    'establishment_id' => $current->id,
                    'metadata' => [
                        'urgency' => $case['urgency'],
                        'preferences' => ['ai_test_case' => true],
                        'constraints' => ['same_specialty_required' => true],
                        'history' => ['acceptance_rate' => 0.9],
                    ],
                ]
            );

            $formateur->etablissements()->syncWithoutDetaching([$current->id]);

            DemandePermutation::updateOrCreate(
                ['formateur_id' => $formateur->id, 'etat_id' => $pending->id],
                [
                    'motif' => $case['motif'],
                    'region_souhaitee_id' => $target->ville?->parent_id,
                    'ville_souhaitee_id' => $target->city_id,
                    'etablissement_souhaite_id' => $target->id,
                    'date_soumission' => now()->subDays(10 - $index),
                    'date_traitement' => null,
                    'commentaire_commission' => null,
                    'traite_par_utilisateur_id' => null,
                ]
            );
        }
    }
}
