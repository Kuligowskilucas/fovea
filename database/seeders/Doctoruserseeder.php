<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DoctorUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => env('SEED_DOCTOR_EMAIL', 'medica@fovea.local')],
            [
                'name' => env('SEED_DOCTOR_NAME', 'Médica'),
                'password' => env('SEED_DOCTOR_PASSWORD', 'trocar-esta-senha'),
                'email_verified_at' => now(),
            ]
        );
    }
}