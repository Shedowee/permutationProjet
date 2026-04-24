<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\DemandePermutation;
use App\Models\Formateur;
use App\Models\Parametre;
use App\Models\Etablissement;

class PermutationMarketSeeder extends Seeder
{
    public function run(): void
    {
        $etatPending = Parametre::where('type', 'ETAT')->where('key', 'EN_ATTENTE')->first();
        if (!$etatPending) return;

        $mapForm = function(string $emp){ return Formateur::where('employee_number', $emp)->first(); };
        $etab = fn(string $name) => Etablissement::where('name', $name)->first();

        // Pair 1: M001 <-> M002 (Casa <-> Salé)
        $m001 = $mapForm('M001');
        $m002 = $mapForm('M002');
        $sale = $etab('ISTA SALE TABRIQUET');
        $maarif = $etab('ISTA MAARIF');

        if ($m001 && $sale) {
            DemandePermutation::updateOrCreate(
                ['formateur_id' => $m001->id, 'etat_id' => $etatPending->id],
                [
                    'motif' => 'Rapprochement familial',
                    'region_souhaitee_id' => $sale->ville?->parent_id,
                    'ville_souhaitee_id' => $sale->city_id,
                    'etablissement_souhaite_id' => $sale->id,
                    'date_soumission' => now()->subDays(3),
                ]
            );
        }
        if ($m002 && $maarif) {
            DemandePermutation::updateOrCreate(
                ['formateur_id' => $m002->id, 'etat_id' => $etatPending->id],
                [
                    'motif' => 'Projet personnel à Casablanca',
                    'region_souhaitee_id' => $maarif->ville?->parent_id,
                    'ville_souhaitee_id' => $maarif->city_id,
                    'etablissement_souhaite_id' => $maarif->id,
                    'date_soumission' => now()->subDays(2),
                ]
            );
        }

        // Pair 2: M003 <-> M004 (Tanger <-> Rabat)
        $m003 = $mapForm('M003');
        $m004 = $mapForm('M004');
        $tanger1 = $etab('ISTA TANGER 1');
        $hayRiad = $etab('ISTA HAY RIAD');

        if ($m003 && $hayRiad) {
            DemandePermutation::updateOrCreate(
                ['formateur_id' => $m003->id, 'etat_id' => $etatPending->id],
                [
                    'motif' => 'Mutation souhaitée vers Rabat',
                    'region_souhaitee_id' => $hayRiad->ville?->parent_id,
                    'ville_souhaitee_id' => $hayRiad->city_id,
                    'etablissement_souhaite_id' => $hayRiad->id,
                    'date_soumission' => now()->subDays(7),
                ]
            );
        }
        if ($m004 && $tanger1) {
            DemandePermutation::updateOrCreate(
                ['formateur_id' => $m004->id, 'etat_id' => $etatPending->id],
                [
                    'motif' => 'Retour familial à Tanger',
                    'region_souhaitee_id' => $tanger1->ville?->parent_id,
                    'ville_souhaitee_id' => $tanger1->city_id,
                    'etablissement_souhaite_id' => $tanger1->id,
                    'date_soumission' => now()->subDays(6),
                ]
            );
        }
    }
}

