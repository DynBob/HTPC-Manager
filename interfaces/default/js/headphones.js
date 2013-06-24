$(document).ready(function () {
    loadHeadphonesHistory();
    loadHeadphonesUpcoming();
    loadHeadphonesArtists();
    
    $('#add_show_button').click(function () {
        $(this).attr('disabled', true);
        searchTvDb($('#add_show_name').val())
    });

    $('#add_tvdbid_button').click(function () {
        addShow($('#add_show_select').val());
    });

    $('#cancel_show_button').click(function () {
        cancelAddShow();
    });
    
});

function loadHeadphonesArtists() {
    $.ajax({
        url: WEBDIR + 'headphones/GetArtists',
        type: 'get',
        dataType: 'json',
        success: function (result) {
            $.each(result, function(i, item) {
                var artist = $('<a>').attr('href',WEBDIR + 'headphones/artist/' + item.ArtistID).text(item.ArtistName);
                var album = $('<a>').attr('href',WEBDIR + 'headphones/album/' + item.AlbumID).text((item.LatestAlbum) + ' (' + (item.ReleaseDate) + ')');
                var row = $('<tr>');
                row.append($('<td>').html(thumb));
                row.append($('<td>').html(artist));
                row.append($('<td>').html(album));
                row.append($('<td>').text((item.HaveTracks) + '/' + (item.TotalTracks)));
                $('#artists-grid').prepend(row);
            });
        }
    });
}

function loadHeadphonesUpcoming() {
    $.ajax({
        url: WEBDIR + 'headphones/GetUpcoming',
        type: 'get',
        dataType: 'json',
        success: function (result) {
            $.each(result, function(i, item) {
                var row = $('<tr>');
                row.append($('<td>').text(item.ArtistName));
                row.append($('<td>').text(item.AlbumTitle));
                row.append($('<td>').text(item.ReleaseDate));
                row.append($('<td>').text(item.Status));
                $('#upcoming-grid').prepend(row);
            });
        }
    });
}

function loadHeadphonesHistory() {
    $.ajax({
        url: WEBDIR + 'headphones/GetHistory',
        type: 'get',
        dataType: 'json',
        success: function (result) {
            $.each(result, function(i, item) {
                if(i > 14) {
                return false
                }
                var row = $('<tr>');
                row.append($('<td>').text(item.DateAdded));
                row.append($('<td>').text(item.Title));
                row.append($('<td>').text(item.Status));
                $('#history-grid').prepend(row);
            });
        }
    });
}

function searchTvDb(query) {
    $.ajax({
        url: WEBDIR + 'sickbeard/SearchShow?query=' + query,
        type: 'get',
        dataType: 'xml',
        success: function (result) {
            series = $(result).find('Series');
            if (series.length == 0) {
                $('#add_show_button').attr('disabled', false);
                return;
            }
            $('#add_show_select').html('');
            series.each(function() {
                var tvdbid = $(this).find('seriesid').text();
                var showname = $(this).find('SeriesName').text();
                var language = $(this).find('language').text();
                var option = $('<option>');
                option.attr('value', tvdbid);
                option.html(showname + ' (' + language + ')');
                $('#add_show_select').append(option);
            });
            $('#add_show_name').hide();
            $('#cancel_show_button').show();
            $('#add_show_select').fadeIn();
            $('#add_show_button').attr('disabled', false).hide();
            $('#add_tvdbid_button').show();
        }
    });
}

function addShow(tvdbid) {
    $.ajax({
        url: WEBDIR + 'sickbeard/AddShow?tvdbid=' + tvdbid,
        type: 'get',
        dataType: 'json',
        success: function (data) {
            notify('Add TV show',data.message,'success');
            cancelAddShow();
        }
    });
}