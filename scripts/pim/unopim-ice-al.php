<?php
// Adim 4: CSV ice alimi — yonetim panelindeki "Import Now" akisinin aynisi
// (ImportController@store + @importNow): is tanimi + takip kaydi + kuyruga ImportTrackBatch.
// ⚠www-data ile kostur (docker compose exec -u www-data -e HOME=/tmp): root ile yazilan imports/
// dizini 0700 root olur, kuyruk iscisi dosyayi goremez ("source file could not be found", olculdu).
use Illuminate\Support\Facades\Storage;
use Webkul\DataTransfer\Helpers\Import;
use Webkul\DataTransfer\Jobs\Import\ImportTrackBatch;

$kod = 'vortice_lineo_quiet_' . date('Ymd_His');
$yol = 'imports/' . $kod . '.csv';
Storage::disk('private')->put($yol, file_get_contents('/tmp/vortice-lineo-quiet.csv'));

$is = app(\Webkul\DataTransfer\Repositories\JobInstancesRepository::class)->create([
    'code' => $kod, 'entity_type' => 'products', 'type' => 'import', 'action' => 'append',
    'validation_strategy' => Import::VALIDATION_STRATEGY_SKIP_ERRORS, 'allowed_errors' => 0,
    'field_separator' => ',', 'file_path' => $yol,
]);
$admin = \DB::table('admins')->orderBy('id')->value('id');
$takip = app(\Webkul\DataTransfer\Repositories\JobTrackRepository::class)->create([
    'type' => 'import', 'state' => Import::STATE_PENDING,
    'validation_strategy' => $is->validation_strategy, 'allowed_errors' => $is->allowed_errors,
    'field_separator' => $is->field_separator, 'file_path' => $is->file_path,
    'images_directory_path' => null, 'meta' => $is->toArray(), 'job_instances_id' => $is->id,
    'user_id' => $admin, 'created_at' => now(), 'updated_at' => now(), 'action' => $is->action,
]);
ImportTrackBatch::dispatch($takip);
echo "kuyrukta takip_id={$takip->id} is_id={$is->id}\n";
