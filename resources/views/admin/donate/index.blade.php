@extends('layouts.admin')

@section('title')
    Support Us
@endsection

@section('content-header')
    <h1>Support Us<small>Dukung developer Pterodactyl Panel Mod ini.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Support Us</li>
    </ol>
@endsection

@section('content')
<div class="row">
    <div class="col-xs-12 col-md-8 col-md-offset-2">
        <div class="box box-primary">
            <div class="box-body text-center" style="padding: 40px 20px;">
                <i class="fa fa-heart text-danger" style="font-size: 64px; margin-bottom: 20px; animation: pulse 2s infinite;"></i>
                <h2>Terima Kasih Atas Dukungan Anda!</h2>
                <p class="text-muted" style="font-size: 16px; margin-bottom: 30px;">
                    Dukungan finansial dari Anda sangat membantu kami untuk terus mengembangkan, merawat, dan memberikan pembaruan terbaik untuk <strong>zzamcode panel</strong>.
                </p>

                <div id="alert-message" class="alert hidden"></div>

                <div class="row">
                    <div class="col-sm-8 col-sm-offset-2">
                        <div class="form-group">
                            <label class="control-label">Pilih Nominal Donasi (Rp)</label>
                            <div class="btn-group btn-group-justified" role="group" style="margin-bottom: 15px;">
                                <div class="btn-group" role="group">
                                    <button type="button" class="btn btn-default btn-amount" data-amount="10000">10.000</button>
                                </div>
                                <div class="btn-group" role="group">
                                    <button type="button" class="btn btn-default btn-amount" data-amount="20000">20.000</button>
                                </div>
                                <div class="btn-group" role="group">
                                    <button type="button" class="btn btn-default btn-amount" data-amount="50000">50.000</button>
                                </div>
                                <div class="btn-group" role="group">
                                    <button type="button" class="btn btn-default btn-amount" data-amount="100000">100.000</button>
                                </div>
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="control-label" for="custom_amount">Atau Masukkan Nominal Lainnya (Rp)</label>
                            <input type="number" id="custom_amount" class="form-control text-center" placeholder="Min. 1000" min="1000">
                        </div>

                        <div class="form-group">
                            <label class="control-label" for="support_message">Pesan Dukungan (Opsional)</label>
                            <textarea id="support_message" class="form-control" rows="3" placeholder="Semangat terus ngodingnya!"></textarea>
                        </div>

                        <button type="button" id="btn-donate" class="btn btn-success btn-lg btn-block" style="margin-top: 20px; font-weight: bold;">
                            <i class="fa fa-credit-card"></i> Lanjutkan Pembayaran
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
.btn-amount.active {
    background-color: #00a65a;
    color: white;
    border-color: #008d4c;
}
</style>
@endsection

@section('footer-scripts')
@parent
<script>
$(document).ready(function() {
    let selectedAmount = 0;

    $('.btn-amount').click(function() {
        $('.btn-amount').removeClass('active');
        $(this).addClass('active');
        selectedAmount = parseInt($(this).data('amount'));
        $('#custom_amount').val('');
    });

    $('#custom_amount').on('input', function() {
        $('.btn-amount').removeClass('active');
        selectedAmount = parseInt($(this).val()) || 0;
    });

    $('#btn-donate').click(function() {
        if (selectedAmount < 1000) {
            $('#alert-message').removeClass('hidden alert-success').addClass('alert-danger').text('Nominal donasi minimal Rp 1.000').show();
            return;
        }

        const message = $('#support_message').val();
        const btn = $(this);
        
        btn.prop('disabled', true).html('<i class="fa fa-spinner fa-spin"></i> Memproses...');
        $('#alert-message').hide();

        $.ajax({
            url: '{{ route("admin.donate.process") }}',
            type: 'POST',
            data: {
                _token: '{{ csrf_token() }}',
                amount: selectedAmount,
                message: message
            },
            success: function(response) {
                if (response.success && response.paymentUrl) {
                    window.location.href = response.paymentUrl;
                } else {
                    $('#alert-message').removeClass('hidden alert-success').addClass('alert-danger').text('Gagal mendapatkan link pembayaran.').show();
                    btn.prop('disabled', false).html('<i class="fa fa-credit-card"></i> Lanjutkan Pembayaran');
                }
            },
            error: function(xhr) {
                let errorMsg = 'Terjadi kesalahan saat memproses pembayaran.';
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    errorMsg = xhr.responseJSON.message;
                }
                $('#alert-message').removeClass('hidden alert-success').addClass('alert-danger').text(errorMsg).show();
                btn.prop('disabled', false).html('<i class="fa fa-credit-card"></i> Lanjutkan Pembayaran');
            }
        });
    });
});
</script>
@endsection
