<?php
// Adim 4: CSV ice alimi — yonetim panelindeki "Import Now" akisinin aynisi
// (ImportController@store + @importNow): is tanimi + takip kaydi + kuyruga ImportTrackBatch.
// ⚠www-data ile kostur (docker exec -u www-data -e HOME=/tmp): root ile yazilan imports/
// dizini 0700 root olur, kuyruk iscisi dosyayi goremez ("source file could not be found", olculdu).
// ⚠`use` SATIRI YOK: `php artisan tinker` stdin'inde `use ...Storage` tinker'in kendi takma adiyla
// cakisiyor ("Cannot use ... Storage because the name is already in use", 2026-09-23 olculdu) →
// siniflar TAM adla yazilir.
//
// Tam yukleme (REC-357 §1, unopim-tam.cjs ice-al): ICE_AL_KOD + ICE_AL_CSV ortamdan gelir.
// Verilmezse pilotun sabit dosyasi (geriye uyum). Kosum: `php artisan tinker` stdin'i (unopim-tam.cjs yapar).
$kod = (getenv('ICE_AL_KOD') ?: 'vortice_lineo_quiet') . '_' . date('Ymd_His');
$yol = 'imports/' . $kod . '.csv';
\Illuminate\Support\Facades\Storage::disk('private')->put($yol, file_get_contents(getenv('ICE_AL_CSV') ?: '/tmp/vortice-lineo-quiet.csv'));

$is = app(\Webkul\DataTransfer\Repositories\JobInstancesRepository::class)->create([
    'code' => $kod, 'entity_type' => 'products', 'type' => 'import', 'action' => 'append',
    'validation_strategy' => \Webkul\DataTransfer\Helpers\Import::VALIDATION_STRATEGY_SKIP_ERRORS, 'allowed_errors' => 0,
    'field_separator' => ',', 'file_path' => $yol,
]);
$admin = \DB::table('admins')->orderBy('id')->value('id');
$takip = app(\Webkul\DataTransfer\Repositories\JobTrackRepository::class)->create([
    'type' => 'import', 'state' => \Webkul\DataTransfer\Helpers\Import::STATE_PENDING,
    'validation_strategy' => $is->validation_strategy, 'allowed_errors' => $is->allowed_errors,
    'field_separator' => $is->field_separator, 'file_path' => $is->file_path,
    'images_directory_path' => null, 'meta' => $is->toArray(), 'job_instances_id' => $is->id,
    'user_id' => $admin, 'created_at' => now(), 'updated_at' => now(), 'action' => $is->action,
]);
\Webkul\DataTransfer\Jobs\Import\ImportTrackBatch::dispatch($takip);
echo "kuyrukta takip_id={$takip->id} is_id={$is->id}\n";
